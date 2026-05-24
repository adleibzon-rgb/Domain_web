#!/usr/bin/env bash
# Domain Scanner — one-command VPS install (Docker Compose + nginx)
set -euo pipefail

REPO_URL="${DOMAIN_SCANNER_REPO_URL:-https://github.com/andrey271192/Domain_web.git}"
BRANCH="${DOMAIN_SCANNER_BRANCH:-main}"
INSTALL_DIR="${DOMAIN_SCANNER_INSTALL_DIR:-/opt/domain_web}"
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

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker already installed"
    return
  fi
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker.socket docker.service
  systemctl start docker.socket
  systemctl start docker.service
}

stop_legacy() {
  log "Stopping legacy GeoExport mirror (if present)..."
  systemctl stop "${LEGACY_SERVICE}.service" 2>/dev/null || true
  systemctl disable "${LEGACY_SERVICE}.service" 2>/dev/null || true
  rm -f "/etc/systemd/system/${LEGACY_SERVICE}.service"
  rm -f "/etc/nginx/sites-enabled/${LEGACY_NGINX}"
  rm -f "/etc/nginx/sites-available/${LEGACY_NGINX}"
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
  export PORT="${APP_PORT}"
}

deploy_compose() {
  cd "${INSTALL_DIR}"
  export PORT="${APP_PORT}"
  AVAIL_KB=$(df -k "${INSTALL_DIR}" | awk 'NR==2 {print $4}')
  if [[ "${AVAIL_KB:-0}" -lt 2500000 ]]; then
    log "Low disk — Node-native deploy..."
    bash "${INSTALL_DIR}/scripts/install-node.sh"
    return
  fi
  log "Building Docker stack..."
  if docker compose version >/dev/null 2>&1; then
    if ! docker compose build 2>&1; then
      log "Docker build failed — Node-native deploy..."
      bash "${INSTALL_DIR}/scripts/install-node.sh"
      return
    fi
    docker compose up -d
    docker compose exec -T web npx prisma db push
  else
    if ! docker-compose build 2>&1; then
      bash "${INSTALL_DIR}/scripts/install-node.sh"
      return
    fi
    docker-compose up -d
    docker-compose exec -T web npx prisma db push
  fi
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
  sleep 5
  if ! curl -fsS -o /dev/null "http://127.0.0.1:${APP_PORT}/api/health"; then
    echo "App health check failed on port ${APP_PORT}" >&2
    cd "${INSTALL_DIR}" && docker compose logs --tail=40 web 2>/dev/null || true
    exit 1
  fi
  local title
  title="$(curl -fsS "http://127.0.0.1/" | grep -o '<title>[^<]*</title>' | head -1 || true)"
  if echo "${title}" | grep -qi geoexport; then
    echo "ERROR: GeoExport mirror still served — aborting" >&2
    exit 1
  fi
  if ! curl -fsS -o /dev/null "http://127.0.0.1/"; then
    echo "nginx not serving on :80" >&2
    exit 1
  fi
  local ip
  ip="$(hostname -I | awk '{print $1}')"
  log "Done. Domain Scanner: http://${ip}/"
  log "Title check: ${title:-ok}"
}

need_root
install_packages
install_docker
stop_legacy
clone_or_update
setup_env
deploy_compose
install_nginx
verify
