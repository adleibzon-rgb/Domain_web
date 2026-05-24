#!/usr/bin/env bash
set -euo pipefail

BASE="${SMOKE_BASE_URL:-http://127.0.0.1:3000}"
DOMAIN="${SMOKE_DOMAIN:-example.com}"

echo "[smoke] health"
curl -fsS "${BASE}/api/health" | grep -q '"ok"' || { echo "health failed"; exit 1; }

echo "[smoke] scan POST"
SCAN_JSON="$(curl -fsS -X POST "${BASE}/api/scan" \
  -H 'Content-Type: application/json' \
  -d "{\"domain\":\"${DOMAIN}\"}")"
SCAN_ID="$(echo "${SCAN_JSON}" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)"
if [[ -z "${SCAN_ID}" ]]; then
  echo "scan id missing: ${SCAN_JSON}"
  exit 1
fi

echo "[smoke] wait scan ${SCAN_ID}"
for _ in $(seq 1 90); do
  STATUS="$(curl -fsS "${BASE}/api/scan/${SCAN_ID}" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p' | head -1)"
  if [[ "${STATUS}" == "COMPLETED" || "${STATUS}" == "FAILED" ]]; then
    break
  fi
  sleep 1
done
if [[ "${STATUS}" != "COMPLETED" ]]; then
  echo "scan did not complete: ${STATUS}"
  exit 1
fi

for path in / /dashboard /analytics /monitoring /api-docs /login; do
  echo "[smoke] GET ${path}"
  code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}${path}")"
  if [[ "${code}" != "200" ]]; then
    echo "page ${path} returned ${code}"
    exit 1
  fi
done

echo "[smoke] OK"
