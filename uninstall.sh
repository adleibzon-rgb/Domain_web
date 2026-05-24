#!/usr/bin/env bash
# GeoExport site — one-command uninstall (does not wipe the whole server)
set -euo pipefail

INSTALL_DIR="${GEOEXPORT_INSTALL_DIR:-/opt/domain_web}"
SERVICE_NAME="geoexport-site"
NGINX_SITE="geoexport-site"

log() { echo "[geoexport-uninstall] $*"; }
need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Запустите от root: sudo bash uninstall.sh" >&2
    exit 1
  fi
}

stop_services() {
  log "Остановка ${SERVICE_NAME}..."
  systemctl stop "${SERVICE_NAME}.service" 2>/dev/null || true
  systemctl disable "${SERVICE_NAME}.service" 2>/dev/null || true
  rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
  systemctl daemon-reload
}

remove_nginx() {
  log "Удаление конфигурации nginx..."
  rm -f "/etc/nginx/sites-enabled/${NGINX_SITE}"
  rm -f "/etc/nginx/sites-available/${NGINX_SITE}"
  if command -v nginx >/dev/null 2>&1; then
    if [[ -d /etc/nginx/sites-available ]] && [[ ! -e /etc/nginx/sites-enabled/default ]]; then
      if [[ -f /etc/nginx/sites-available/default ]]; then
        ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
      fi
    fi
    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
  fi
}

remove_files() {
  log "Удаление файлов в ${INSTALL_DIR}..."
  rm -rf "${INSTALL_DIR}"
}

need_root
stop_services
remove_nginx
remove_files
log "Сайт GeoExport удалён. nginx/node/git на сервере не удалялись."
