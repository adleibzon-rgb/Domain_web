#!/usr/bin/env bash
# Domain Web — full deploy: static site + search API (nginx :80)
# curl -fsSL https://raw.githubusercontent.com/andrey271192/Domain_web/main/install.sh | sudo bash
set -euo pipefail

REPO_URL="${DOMAIN_WEB_REPO_URL:-https://github.com/andrey271192/Domain_web.git}"
BOT_REPO_URL="${DOMAIN_FINDER_REPO:-https://github.com/andrey271192/domain-finder-bot.git}"
BRANCH="${DOMAIN_WEB_BRANCH:-main}"
INSTALL_SRC="${DOMAIN_WEB_INSTALL_SRC:-/opt/domain-web-src}"
WEB_ROOT="${DOMAIN_WEB_ROOT:-/var/www/domain-web}"
API_DIR="${DOMAIN_WEB_API_DIR:-/opt/domain-web-api}"
BOT_DIR="${DOMAIN_FINDER_BOT_DIR:-/opt/domain-finder-bot}"
NGINX_SITE="domain-web"
API_SERVICE="domain-web-api"
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
  log "Installing system packages..."
  apt-get update -qq
  apt-get install -y -qq \
    nginx git curl ca-certificates rsync \
    python3 python3-venv python3-pip >/dev/null
}

ensure_domainbot_user() {
  if ! id domainbot >/dev/null 2>&1; then
    log "Creating system user domainbot..."
    useradd --system --home "${BOT_DIR}" --shell /usr/sbin/nologin domainbot
  fi
  mkdir -p "${BOT_DIR}/data" "${API_DIR}"
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

clone_discovery_bot() {
  log "Fetching discovery modules (${BOT_REPO_URL})..."
  if [[ -d "${BOT_DIR}/.git" ]]; then
    git -C "${BOT_DIR}" fetch --depth 1 origin main 2>/dev/null || true
    git -C "${BOT_DIR}" reset --hard origin/main 2>/dev/null || \
      git -C "${BOT_DIR}" pull --ff-only 2>/dev/null || true
  else
    rm -rf "${BOT_DIR}"
    git clone --depth 1 "${BOT_REPO_URL}" "${BOT_DIR}"
  fi

  if [[ ! -x "${BOT_DIR}/.venv/bin/python" ]]; then
    log "Creating domain-finder-bot venv (discovery deps)..."
    python3 -m venv "${BOT_DIR}/.venv"
    "${BOT_DIR}/.venv/bin/pip" install -q -U pip
    "${BOT_DIR}/.venv/bin/pip" install -q -r "${BOT_DIR}/requirements.txt"
  fi
}

deploy_web() {
  log "Deploying static site to ${WEB_ROOT}..."
  mkdir -p "${WEB_ROOT}/data"
  rsync -a --delete "${INSTALL_SRC}/web/" "${WEB_ROOT}/"

  if [[ ! -f "${WEB_ROOT}/data/site-config.json" ]]; then
    cp "${INSTALL_SRC}/web/data/site-config.json.example" "${WEB_ROOT}/data/site-config.json"
  fi

  chown -R www-data:www-data "${WEB_ROOT}" 2>/dev/null || \
    chown -R nginx:nginx "${WEB_ROOT}" 2>/dev/null || true
}

deploy_api() {
  log "Deploying search API to ${API_DIR}..."
  mkdir -p "${API_DIR}"
  rsync -a --delete "${INSTALL_SRC}/api/" "${API_DIR}/"

  if [[ ! -x "${API_DIR}/.venv/bin/python" ]]; then
    python3 -m venv "${API_DIR}/.venv"
  fi
  "${API_DIR}/.venv/bin/pip" install -q -U pip
  "${API_DIR}/.venv/bin/pip" install -q -r "${API_DIR}/requirements.txt"

  chown -R domainbot:domainbot "${API_DIR}" "${BOT_DIR}"
}

install_systemd() {
  log "Installing ${API_SERVICE}.service..."
  cp "${INSTALL_SRC}/systemd/domain-web-api.service" "/etc/systemd/system/${API_SERVICE}.service"
  systemctl daemon-reload
  systemctl enable "${API_SERVICE}.service"
  systemctl restart "${API_SERVICE}.service"
}

configure_nginx() {
  log "Configuring nginx (HTTP :80 only — port 443 untouched)..."
  local conf_src="${INSTALL_SRC}/nginx/domain-web.conf"
  local snippet_src="${INSTALL_SRC}/nginx/domain-web-api.conf"

  if [[ ! -f "${conf_src}" ]] || [[ ! -f "${snippet_src}" ]]; then
    echo "Missing nginx config in repo" >&2
    exit 1
  fi

  if [[ -f /etc/nginx/sites-enabled/default ]] && ! grep -q "domain-web" /etc/nginx/sites-enabled/default 2>/dev/null; then
    if grep -q "listen 80" /etc/nginx/sites-enabled/default 2>/dev/null; then
      mv /etc/nginx/sites-enabled/default "/etc/nginx/sites-enabled/default.bak.$(date +%s)" 2>/dev/null || true
    fi
  fi

  cp "${snippet_src}" /etc/nginx/snippets/domain-web-api.conf
  sed "s|WEB_ROOT|${WEB_ROOT}|g" "${conf_src}" > "/etc/nginx/sites-available/${NGINX_SITE}"
  ln -sf "/etc/nginx/sites-available/${NGINX_SITE}" "/etc/nginx/sites-enabled/${NGINX_SITE}"

  nginx -t
  systemctl enable nginx
  systemctl reload nginx
}

allow_firewall() {
  if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
    log "Allowing HTTP (80) in ufw..."
    ufw allow 80/tcp >/dev/null 2>&1 || true
  fi
}

verify() {
  log "Verifying deployment..."
  sleep 2

  if ! systemctl is-active --quiet "${API_SERVICE}.service"; then
    journalctl -u "${API_SERVICE}.service" -n 30 --no-pager || true
    echo "ERROR: ${API_SERVICE} failed to start" >&2
    exit 1
  fi

  if ! curl -fsS "http://127.0.0.1:8081/api/health" | grep -q '"status"'; then
    echo "ERROR: API health check failed" >&2
    exit 1
  fi

  for path in / /search /connect.html /domains.html; do
    code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1${path}")"
    if [[ "${code}" != "200" && "${code}" != "301" && "${code}" != "302" ]]; then
      echo "WARNING: http://127.0.0.1${path} returned ${code}" >&2
    fi
  done
}

print_done() {
  local ip
  ip="$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'SERVER_IP')"
  log "Done."
  echo ""
  echo "  Site:       http://${ip}/"
  echo "  Search:     http://${ip}/search"
  echo "  Connect:    http://${ip}/connect.html"
  echo "  Domains:    http://${ip}/domains.html"
  echo ""
  echo "  Telegram proxy config: ${WEB_ROOT}/data/site-config.json"
  echo "  API service: systemctl status ${API_SERVICE}"
  echo ""
  echo "  Port 443 / Docker / Amnezia were not modified."
  echo ""
}

main() {
  need_root
  install_packages
  ensure_domainbot_user
  stop_legacy_scanner
  clone_repo
  clone_discovery_bot
  deploy_web
  deploy_api
  install_systemd
  configure_nginx
  allow_firewall
  verify
  print_done
}

main "$@"
