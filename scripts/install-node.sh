#!/usr/bin/env bash
# Node-native production deploy (low disk — no Docker image build)
set -euo pipefail

INSTALL_DIR="${DOMAIN_SCANNER_INSTALL_DIR:-/opt/domain_web}"
SERVICE_NAME="domain-scanner"
NGINX_SITE="domain-scanner"
APP_PORT="${DOMAIN_SCANNER_PORT:-3000}"
NODE_PORT="${APP_PORT}"

log() { echo "[domain-scanner-node] $*"; }

install_packages() {
  apt-get update -qq
  apt-get install -y -qq nginx git curl ca-certificates >/dev/null
  if ! command -v node >/dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y -qq nodejs >/dev/null
  fi
}

setup_compose_db() {
  cd "${INSTALL_DIR}"
  if command -v docker-compose >/dev/null; then
    DC=docker-compose
  else
    DC="docker compose"
  fi
  $DC up -d postgres redis
  sleep 5
}

setup_env() {
  if [[ ! -f "${INSTALL_DIR}/.env" ]]; then
    cp "${INSTALL_DIR}/.env.example" "${INSTALL_DIR}/.env"
    SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    cat >>"${INSTALL_DIR}/.env" <<EOF
EOF
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://scanner:scanner@127.0.0.1:5432/domain_scanner?schema=public|" "${INSTALL_DIR}/.env"
    sed -i "s|^REDIS_URL=.*|REDIS_URL=redis://127.0.0.1:6379|" "${INSTALL_DIR}/.env"
    sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|" "${INSTALL_DIR}/.env"
    sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$(hostname -I | awk '{print $1}')|" "${INSTALL_DIR}/.env"
    sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://$(hostname -I | awk '{print $1}')|" "${INSTALL_DIR}/.env"
  fi
  export PORT="${NODE_PORT}"
}

build_app() {
  cd "${INSTALL_DIR}"
  npm ci
  npx prisma generate
  npm run build
  npx prisma db push --accept-data-loss
}

install_systemd() {
  cat >"/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Domain Scanner (Next.js)
After=network.target docker.service

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=/usr/bin/npm start
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
  cat >"/etc/nginx/sites-available/${NGINX_SITE}" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:${NODE_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
  rm -f /etc/nginx/sites-enabled/geoexport-site /etc/nginx/sites-available/geoexport-site
  systemctl stop geoexport-site 2>/dev/null || true
  rm -f /etc/nginx/sites-enabled/default
  ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
  nginx -t && systemctl restart nginx
}

if [[ "${EUID}" -ne 0 ]]; then echo "Run as root" >&2; exit 1; fi
install_packages
setup_env
setup_compose_db
build_app
install_systemd
install_nginx
log "Done: http://$(hostname -I | awk '{print $1}')/"
