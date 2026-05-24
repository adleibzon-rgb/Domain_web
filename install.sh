#!/usr/bin/env bash
# Domain Scanner — VPS install (Postgres/Redis in Docker, Next.js on host)
# Full `docker compose up` (web image) needs ~4GB free disk; this script uses the lite path.
set -euo pipefail

REPO_URL="${DOMAIN_SCANNER_REPO_URL:-https://github.com/andrey271192/Domain_web.git}"
BRANCH="${DOMAIN_SCANNER_BRANCH:-main}"
INSTALL_DIR="${DOMAIN_SCANNER_INSTALL_DIR:-/opt/domain-scanner}"
SERVICE_NAME="domain-scanner"
NGINX_SITE="domain-scanner"
APP_PORT="${DOMAIN_SCANNER_PORT:-3000}"
LEGACY_SERVICE="geoexport-site"
LEGACY_NGINX="geoexport-site"

export DEBIAN_FRONTEND=noninteractive

log() { echo "[domain-scanner-install] $*"; }
need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Run as root: sudo bash install.sh" >&2
    exit 1
  fi
}

install_packages() {
  log "Installing system packages..."
  apt-get update -qq
  apt-get install -y -qq curl ca-certificates git nginx openssl >/dev/null
}

install_node() {
  if command -v node >/dev/null 2>&1 && [[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ]]; then
    log "Node $(node -v) already installed"
    return
  fi
  log "Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs >/dev/null
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker already installed"
  else
    log "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
  fi
  systemctl enable docker.socket docker.service 2>/dev/null || true
  systemctl start docker.socket 2>/dev/null || true
  systemctl start docker.service 2>/dev/null || true
}

stop_legacy() {
  log "Stopping legacy GeoExport mirror (if present)..."
  systemctl stop "${LEGACY_SERVICE}.service" 2>/dev/null || true
  systemctl disable "${LEGACY_SERVICE}.service" 2>/dev/null || true
  rm -f "/etc/systemd/system/${LEGACY_SERVICE}.service"
  rm -f "/etc/nginx/sites-enabled/${LEGACY_NGINX}"
  rm -f "/etc/nginx/sites-available/${LEGACY_NGINX}"
  rm -rf /opt/domain_web 2>/dev/null || true
  systemctl daemon-reload 2>/dev/null || true
}

clone_or_update() {
  log "Cloning/updating repository at ${INSTALL_DIR}..."
  if [[ -d "${INSTALL_DIR}/.git" ]]; then
    git -C "${INSTALL_DIR}" fetch origin "${BRANCH}"
    git -C "${INSTALL_DIR}" checkout "${BRANCH}"
    git -C "${INSTALL_DIR}" reset --hard "origin/${BRANCH}"
  else
    rm -rf "${INSTALL_DIR}"
    git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${INSTALL_DIR}"
  fi
}

setup_env() {
  local ip
  ip="$(hostname -I | awk '{print $1}')"
  cd "${INSTALL_DIR}"
  if [[ ! -f .env ]]; then
    cp .env.example .env
  fi
  local secret
  secret="$(openssl rand -base64 32)"
  sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${secret}|" .env
  sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://${ip}|" .env
  sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://${ip}|" .env
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://scanner:scanner@127.0.0.1:5432/domain_scanner?schema=public|" .env
  sed -i "s|^REDIS_URL=.*|REDIS_URL=redis://127.0.0.1:6379|" .env
}

deploy_data_services() {
  log "Starting Postgres and Redis (Docker)..."
  cd "${INSTALL_DIR}"
  docker compose up -d postgres redis
  for i in $(seq 1 30); do
    if docker compose exec -T postgres pg_isready -U scanner -d domain_scanner >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
}

build_app() {
  log "Building Next.js app on host..."
  cd "${INSTALL_DIR}"
  export NODE_ENV=production
  npm ci
  npx prisma generate
  npx prisma db push
  npm run build
  # Keep production deps at repo root; `next start` is more reliable than
  # standalone on small VPS (avoids incomplete traced node_modules).
  npm ci --omit=dev
  npx prisma generate
  journalctl --vacuum-size=80M 2>/dev/null || true
  apt-get clean 2>/dev/null || true
}

install_systemd() {
  log "Installing systemd unit (${SERVICE_NAME})..."
  cat >"/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Domain Scanner (Next.js)
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${INSTALL_DIR}/.env
Environment=HOSTNAME=0.0.0.0
Environment=PORT=${APP_PORT}
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start --silent
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable "${SERVICE_NAME}.service"
  systemctl restart "${SERVICE_NAME}.service"
}

install_nginx() {
  log "Configuring nginx reverse proxy..."
  cat >"/etc/nginx/sites-available/${NGINX_SITE}" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 32m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_buffering off;
    }
}
EOF
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
}

verify() {
  log "Verifying deployment..."
  sleep 4
  if ! systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    systemctl status "${SERVICE_NAME}.service" --no-pager || true
    journalctl -u "${SERVICE_NAME}.service" -n 30 --no-pager || true
    exit 1
  fi
  if ! curl -fsS -o /dev/null "http://127.0.0.1:${APP_PORT}/api/health"; then
    echo "Health check failed on port ${APP_PORT}" >&2
    exit 1
  fi
  local title
  title="$(curl -fsS "http://127.0.0.1/" | grep -o '<title>[^<]*</title>' | head -1 || true)"
  if echo "${title}" | grep -qi geoexport; then
    echo "ERROR: GeoExport mirror still served — aborting" >&2
    exit 1
  fi
  local ip
  ip="$(hostname -I | awk '{print $1}')"
  log "Done. Domain Scanner: http://${ip}/"
  log "Title: ${title:-Domain Scanner}"
}

need_root
install_packages
install_node
install_docker
stop_legacy
clone_or_update
setup_env
deploy_data_services
build_app
install_systemd
install_nginx
verify
