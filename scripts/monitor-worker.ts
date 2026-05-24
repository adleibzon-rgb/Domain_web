/**
 * Background monitor checks (DNS change + SSL expiry MVP).
 * Run via: npm run worker:monitors
 */
import { runAllMonitorChecks } from "../src/lib/monitoring/check";

const intervalMs = Number(process.env.MONITOR_INTERVAL_MS ?? 300_000);

async function tick() {
  const summary = await runAllMonitorChecks();
  console.log(
    `[monitor-worker] ${new Date().toISOString()} checked=${summary.checked} with_alerts=${summary.alerts}`
  );
}

async function main() {
  await tick();
  setInterval(() => {
    tick().catch((e) => console.error("[monitor-worker]", e));
  }, intervalMs);
  console.log(`[monitor-worker] interval ${intervalMs / 1000}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
