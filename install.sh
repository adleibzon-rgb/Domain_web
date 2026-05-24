#!/usr/bin/env bash
# GeoExport site — one-command install (Ubuntu/Debian VPS)
set -euo pipefail

REPO_URL="${GEOEXPORT_REPO_URL:-https://github.com/andrey271192/Domain_web.git}"
BRANCH="${GEOEXPORT_BRANCH:-main}"
INSTALL_DIR="${GEOEXPORT_INSTALL_DIR:-/opt/domain_web}"
SITE_DIR="${INSTALL_DIR}/site"
SERVICE_NAME="geoexport-site"
NGINX_SITE="geoexport-site"
NODE_PORT="${GEOEXPORT_PORT:-4173}"

export DEBIAN_FRONTEND=noninteractive

log() { echo "[geoexport-install] $*"; }
need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Запустите от root: sudo bash install.sh" >&2
    exit 1
  fi
}

install_packages() {
  log "Установка пакетов (nginx, git, curl, nodejs)..."
  apt-get update -qq
  apt-get install -y -qq nginx git curl ca-certificates nodejs npm >/dev/null
}

clone_or_update() {
  log "Клонирование/обновление репозитория в ${INSTALL_DIR}..."
  if [[ -d "${INSTALL_DIR}/.git" ]]; then
    git -C "${INSTALL_DIR}" fetch origin "${BRANCH}"
    git -C "${INSTALL_DIR}" checkout "${BRANCH}"
    git -C "${INSTALL_DIR}" reset --hard "origin/${BRANCH}"
  else
    rm -rf "${INSTALL_DIR}"
    git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${INSTALL_DIR}"
  fi
  if [[ ! -f "${SITE_DIR}/server.mjs" ]]; then
    echo "Ошибка: не найден ${SITE_DIR}/server.mjs" >&2
    exit 1
  fi
}

apply_patches() {
  log "Применение патчей фронтенда (export preview/download)..."
  node "${SITE_DIR}/patch-bundle.mjs"
}

install_systemd() {
  log "Настройка systemd (${SERVICE_NAME})..."
  cat >"/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=GeoExport static mirror (Node)
After=network.target

[Service]
Type=simple
WorkingDirectory=${SITE_DIR}
Environment=PORT=${NODE_PORT}
ExecStart=/usr/bin/node ${SITE_DIR}/server.mjs
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
  log "Настройка nginx (${NGINX_SITE})..."
  cat >"/etc/nginx/sites-available/${NGINX_SITE}" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 64m;

    location / {
        proxy_pass http://127.0.0.1:${NODE_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
    }
}
EOF
  rm -f /etc/nginx/sites-enabled/domain-scanner 2>/dev/null || true
  rm -f /etc/nginx/sites-available/domain-scanner 2>/dev/null || true
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
}

verify() {
  log "Проверка..."
  sleep 2
  if ! systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    systemctl status "${SERVICE_NAME}.service" --no-pager || true
    exit 1
  fi
  if ! curl -fsS -o /dev/null "http://127.0.0.1:${NODE_PORT}/"; then
    echo "Node-сервер не отвечает на порту ${NODE_PORT}" >&2
    exit 1
  fi
  if ! curl -fsS -o /dev/null "http://127.0.0.1/"; then
    echo "nginx не отдаёт сайт на :80" >&2
    exit 1
  fi
  log "Готово. Сайт доступен по http://$(hostname -I | awk '{print $1}')/"
}

need_root
install_packages
clone_or_update
apply_patches
install_systemd
install_nginx
verify
