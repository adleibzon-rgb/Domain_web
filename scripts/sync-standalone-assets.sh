#!/usr/bin/env bash
# Copy Next.js static assets into standalone output (required for `node server.js`).
set -euo pipefail

ROOT="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
STANDALONE="${ROOT}/.next/standalone"
STATIC_SRC="${ROOT}/.next/static"
PUBLIC_SRC="${ROOT}/public"

if [[ ! -d "${STANDALONE}" ]]; then
  echo "[sync-standalone-assets] No .next/standalone — skipping (non-standalone build?)" >&2
  exit 0
fi

if [[ ! -d "${STATIC_SRC}" ]]; then
  echo "[sync-standalone-assets] ERROR: missing ${STATIC_SRC} — run npm run build first" >&2
  exit 1
fi

mkdir -p "${STANDALONE}/.next"
rm -rf "${STANDALONE}/.next/static"
cp -a "${STATIC_SRC}" "${STANDALONE}/.next/static"

if [[ -d "${PUBLIC_SRC}" ]]; then
  rm -rf "${STANDALONE}/public"
  cp -a "${PUBLIC_SRC}" "${STANDALONE}/public"
fi

echo "[sync-standalone-assets] OK: .next/static + public → ${STANDALONE}"
