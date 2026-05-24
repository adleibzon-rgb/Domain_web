#!/usr/bin/env bash
# Domain Scanner — one-command install (Ubuntu/Debian VPS)
set -euo pipefail

REPO_URL="${DOMAIN_SCANNER_REPO_URL:-https://github.com/andrey271192/Domain_web.git}"
BRANCH="${DOMAIN_SCANNER_BRANCH:-main}"
INSTALL_DIR="${DOMAIN_SCANNER_INSTALL_DIR:-/opt/domain_web}"
SERVICE_NAME="domain-scanner"
NGINX_SITE="domain-scanner"
APP_PORT="${DOMAIN_SCANNER_PORT:-3000}"

export DEBIAN_FRONTEND=noninteractive

log() { echo "[domain-scanner-install] $*"; }
need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Run as root: sudo bash install.sh" >&2
    exit 1
  fi
}

install_packages() {
  log "Installing nginx, git, curl, docker..."
  apt-get update -qq
  apt-get install -y -qq nginx git curl ca-certificates docker.io docker-compose >/dev/null 2>&1 || \
    apt-get install -y -qq nginx git curl ca-certificates docker.io >/dev/null
  if ! command -v docker-compose >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    ln -sf "$(command -v docker)" /usr/local/bin/docker-compose 2>/dev/null || true
  fi
  systemctl enable docker
  systemctl start docker
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  else
    echo "docker-compose"
  fi
}

clone_or_update() {
  log "Cloning/updating ${INSTALL_DIR}..."
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
  log "Writing .env..."
  if [[ ! -f "${INSTALL_DIR}/.env" ]]; then
    SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    cat >"${INSTALL_DIR}/.env" <<EOF
NEXTAUTH_SECRET=${SECRET}
NEXTAUTH_URL=http://$(hostname -I | awk '{print $1}')
NEXT_PUBLIC_APP_URL=http://$(hostname -I | awk '{print $1}')
PORT=${APP_PORT}
EOF
  fi
}

deploy_docker() {
  log "Building and starting Docker stack..."
  cd "${INSTALL_DIR}"
  COMPOSE=$(compose_cmd)
  $COMPOSE build --quiet
  $COMPOSE up -d
  sleep 12
  $COMPOSE exec -T web npx prisma db push 2>/dev/null || true
}

install_nginx() {
  log "Configuring nginx..."
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
    }
}
EOF
  rm -f /etc/nginx/sites-enabled/geoexport-site 2>/dev/null || true
  rm -f /etc/nginx/sites-available/geoexport-site 2>/dev/null || true
  systemctl stop geoexport-site.service 2>/dev/null || true
  systemctl disable geoexport-site.service 2>/dev/null || true
  rm -f /etc/systemd/system/geoexport-site.service 2>/dev/null || true
  systemctl daemon-reload
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
}

verify() {
  log "Verifying..."
  sleep 3
  if ! curl -fsS -o /dev/null "http://127.0.0.1:${APP_PORT}/"; then
    echo "App not responding on port ${APP_PORT}" >&2
    $(compose_cmd) -f "${INSTALL_DIR}/docker-compose.yml" logs --tail=50 web || true
    exit 1
  fi
  TITLE=$(curl -fsS "http://127.0.0.1/" | head -c 2000 | grep -oi 'Domain Scanner' | head -1 || true)
  if [[ -z "${TITLE}" ]]; then
    log "Warning: page title may not include Domain Scanner yet"
  fi
  log "Done. Open http://$(hostname -I | awk '{print $1}')/"
}

need_root
install_packages
clone_or_update
setup_env
deploy_docker
install_nginx
verify
