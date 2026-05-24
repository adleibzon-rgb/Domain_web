#!/usr/bin/env bash
# Domain Scanner — one-command uninstall
set -euo pipefail

INSTALL_DIR="${DOMAIN_SCANNER_INSTALL_DIR:-/opt/domain_web}"
SERVICE_NAME="domain-scanner"
NGINX_SITE="domain-scanner"
LEGACY_SERVICE="geoexport-site"
LEGACY_NGINX="geoexport-site"

log() { echo "[domain-scanner-uninstall] $*"; }
need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Run as root: sudo bash uninstall.sh" >&2
    exit 1
  fi
}

stop_docker() {
  log "Stopping Docker stack..."
  if [[ -f "${INSTALL_DIR}/docker-compose.yml" ]]; then
    docker compose -f "${INSTALL_DIR}/docker-compose.yml" down -v 2>/dev/null || true
  fi
}

stop_legacy() {
  systemctl stop "${LEGACY_SERVICE}.service" 2>/dev/null || true
  systemctl disable "${LEGACY_SERVICE}.service" 2>/dev/null || true
  rm -f "/etc/systemd/system/${LEGACY_SERVICE}.service"
  systemctl daemon-reload
}

remove_nginx() {
  log "Removing nginx site..."
  for site in "${NGINX_SITE}" "${LEGACY_NGINX}"; do
    rm -f "/etc/nginx/sites-enabled/${site}"
    rm -f "/etc/nginx/sites-available/${site}"
  done
  if command -v nginx >/dev/null 2>&1; then
    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
  fi
}

remove_files() {
  log "Removing ${INSTALL_DIR}..."
  rm -rf "${INSTALL_DIR}"
}

need_root
stop_docker
stop_legacy
remove_nginx
remove_files
log "Domain Scanner removed."
