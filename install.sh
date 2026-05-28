#!/usr/bin/env bash
# Domain Web — lightweight static site (nginx :80)
# curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
set -euo pipefail

REPO_URL="${DOMAIN_WEB_REPO_URL:-https://github.com/andrey271192/Domain_web.git}"
BRANCH="${DOMAIN_WEB_BRANCH:-main}"
INSTALL_SRC="${DOMAIN_WEB_INSTALL_SRC:-/opt/domain-web-src}"
WEB_ROOT="${DOMAIN_WEB_ROOT:-/var/www/domain-web}"
NGINX_SITE="domain-web"
LEGACY_SERVICES=("domain-scanner" "geoexport-site")

export DEBIAN_FRONTEND=noninteractive

log() { echo "[domain-web] $*"; }

need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Run as root: sudo bash" >&2
    exit 1
  fi
}

install_packages() {
  log "Installing nginx, git, curl..."
  apt-get update -qq
  apt-get install -y -qq nginx git curl ca-certificates rsync >/dev/null
}

stop_legacy_scanner() {
  log "Disabling legacy Node scanner site (if present)..."
  for svc in "${LEGACY_SERVICES[@]}"; do
    systemctl stop "${svc}.service" 2>/dev/null || true
    systemctl disable "${svc}.service" 2>/dev/null || true
    rm -f "/etc/systemd/system/${svc}.service"
  done
  rm -f /etc/nginx/sites-enabled/domain-scanner 2>/dev/null || true
  rm -f /etc/nginx/sites-available/domain-scanner 2>/dev/null || true
  systemctl daemon-reload 2>/dev/null || true
}

clone_repo() {
  log "Fetching ${REPO_URL} (${BRANCH})..."
  if [[ -d "${INSTALL_SRC}/.git" ]]; then
    git -C "${INSTALL_SRC}" fetch origin "${BRANCH}"
    git -C "${INSTALL_SRC}" checkout "${BRANCH}"
    git -C "${INSTALL_SRC}" reset --hard "origin/${BRANCH}"
  else
    rm -rf "${INSTALL_SRC}"
    git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${INSTALL_SRC}"
  fi
}

deploy_web() {
  log "Deploying static files to ${WEB_ROOT}..."
  mkdir -p "${WEB_ROOT}"
  rsync -a --delete "${INSTALL_SRC}/web/" "${WEB_ROOT}/"
  chown -R www-data:www-data "${WEB_ROOT}" 2>/dev/null || chown -R nginx:nginx "${WEB_ROOT}" 2>/dev/null || true
}

configure_nginx() {
  log "Configuring nginx (HTTP :80)..."
  local conf_src="${INSTALL_SRC}/nginx/domain-web.conf"
  if [[ ! -f "${conf_src}" ]]; then
    echo "Missing nginx config in repo" >&2
    exit 1
  fi

  # Backup existing default if it listens on 80 and is not ours
  if [[ -f /etc/nginx/sites-enabled/default ]] && ! grep -q "domain-web" /etc/nginx/sites-enabled/default 2>/dev/null; then
    if grep -q "listen 80" /etc/nginx/sites-enabled/default 2>/dev/null; then
      mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak.$(date +%s) 2>/dev/null || true
    fi
  fi

  sed "s|/var/www/domain-web|${WEB_ROOT}|g" "${conf_src}" > "/etc/nginx/sites-available/${NGINX_SITE}"
  ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"

  nginx -t
  systemctl enable nginx
  systemctl reload nginx
}

print_done() {
  local ip
  ip="$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'SERVER_IP')"
  log "Done."
  echo ""
  echo "  Site root:  ${WEB_ROOT}"
  echo "  URL:        http://${ip}/"
  echo "  Pages:      /connect.html  /domains.html"
  echo ""
  echo "  Amnezia (443) and Docker containers were not stopped."
  echo ""
}

main() {
  need_root
  install_packages
  stop_legacy_scanner
  clone_repo
  deploy_web
  configure_nginx
  print_done
}

main "$@"
