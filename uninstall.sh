#!/usr/bin/env bash
# Remove Domain Web site + search API (does not remove Amnezia/Docker/bot)
set -euo pipefail

WEB_ROOT="${DOMAIN_WEB_ROOT:-/var/www/domain-web}"
INSTALL_SRC="${DOMAIN_WEB_INSTALL_SRC:-/opt/domain-web-src}"
API_DIR="${DOMAIN_WEB_API_DIR:-/opt/domain-web-api}"
NGINX_SITE="domain-web"
API_SERVICE="domain-web-api"

log() { echo "[domain-web-uninstall] $*"; }

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash uninstall.sh" >&2
  exit 1
fi

log "Stopping search API..."
systemctl stop "${API_SERVICE}.service" 2>/dev/null || true
systemctl disable "${API_SERVICE}.service" 2>/dev/null || true
rm -f "/etc/systemd/system/${API_SERVICE}.service"
systemctl daemon-reload 2>/dev/null || true

log "Removing nginx site..."
rm -f "/etc/nginx/sites-enabled/${NGINX_SITE}"
rm -f "/etc/nginx/sites-available/${NGINX_SITE}"
rm -f /etc/nginx/snippets/domain-web-api.conf

if [[ ! -f /etc/nginx/sites-enabled/default ]]; then
  if [[ -f /etc/nginx/sites-available/default ]]; then
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true
  fi
fi

nginx -t && systemctl reload nginx

log "Removing deployed files..."
rm -rf "${WEB_ROOT}" "${INSTALL_SRC}" "${API_DIR}"

log "Uninstall complete. domain-finder-bot at /opt/domain-finder-bot was kept."
