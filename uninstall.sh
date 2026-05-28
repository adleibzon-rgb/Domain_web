#!/usr/bin/env bash
# Remove Domain Web nginx site (does not remove Amnezia/Docker)
set -euo pipefail

WEB_ROOT="${DOMAIN_WEB_ROOT:-/var/www/domain-web}"
INSTALL_SRC="${DOMAIN_WEB_INSTALL_SRC:-/opt/domain-web-src}"
NGINX_SITE="domain-web"

log() { echo "[domain-web-uninstall] $*"; }

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash uninstall.sh" >&2
  exit 1
fi

log "Removing nginx site..."
rm -f "/etc/nginx/sites-enabled/${NGINX_SITE}"
rm -f "/etc/nginx/sites-available/${NGINX_SITE}"

if [[ ! -f /etc/nginx/sites-enabled/default ]]; then
  if [[ -f /etc/nginx/sites-available/default ]]; then
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true
  fi
fi

nginx -t && systemctl reload nginx

log "Removing web files (optional paths)..."
rm -rf "${WEB_ROOT}" "${INSTALL_SRC}"

log "Uninstall complete."
