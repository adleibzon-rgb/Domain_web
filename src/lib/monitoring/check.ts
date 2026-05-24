import dns from "node:dns/promises";
import tls from "node:tls";
import { createHash } from "node:crypto";
import type { Monitor } from "@prisma/client";

export type MonitorLastResult = {
  status: "ok" | "warning" | "alert";
  alerts: string[];
  snapshot: Record<string, unknown>;
  checkedAt: string;
};

async function dnsFingerprint(domain: string): Promise<string> {
  const parts: string[] = [];
  try {
    const a = await dns.resolve4(domain);
    parts.push(`A:${[...a].sort().join(",")}`);
  } catch {
    parts.push("A:");
  }
  try {
    const ns = await dns.resolveNs(domain);
    parts.push(`NS:${[...ns].sort().join(",")}`);
  } catch {
    parts.push("NS:");
  }
  try {
    const mx = await dns.resolveMx(domain);
    parts.push(`MX:${mx.map((m) => m.exchange).sort().join(",")}`);
  } catch {
    parts.push("MX:");
  }
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

async function sslDaysRemaining(domain: string): Promise<{ valid: boolean; daysRemaining?: number }> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert?.valid_to) {
          resolve({ valid: false });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / 86400000);
        resolve({ valid: daysRemaining > 0, daysRemaining });
      }
    );
    socket.on("error", () => resolve({ valid: false }));
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ valid: false });
    });
  });
}

async function checkReachable(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    return res.status < 500;
  } catch {
    try {
      const res = await fetch(`http://${domain}`, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      return res.status < 500;
    } catch {
      return false;
    }
  }
}

function previousSnapshot(monitor: Monitor): Record<string, unknown> | undefined {
  const lr = monitor.lastResult as MonitorLastResult | null;
  return lr?.snapshot;
}

export async function runMonitorCheck(monitor: Monitor): Promise<MonitorLastResult> {
  const alerts: string[] = [];
  const snapshot: Record<string, unknown> = {};
  let status: MonitorLastResult["status"] = "ok";
  const prev = previousSnapshot(monitor);

  if (monitor.type === "DNS" || monitor.type === "UPTIME") {
    const dnsHash = await dnsFingerprint(monitor.domain);
    snapshot.dnsHash = dnsHash;
    if (prev?.dnsHash && prev.dnsHash !== dnsHash) {
      alerts.push("DNS records changed");
      status = "alert";
    }
  }

  if (monitor.type === "SSL" || monitor.type === "UPTIME") {
    const ssl = await sslDaysRemaining(monitor.domain);
    snapshot.sslValid = ssl.valid;
    snapshot.sslDays = ssl.daysRemaining;
    if (!ssl.valid) {
      alerts.push("SSL certificate invalid or unreachable");
      status = "alert";
    } else if (ssl.daysRemaining !== undefined && ssl.daysRemaining <= 14) {
      alerts.push(`SSL expires in ${ssl.daysRemaining} day(s)`);
      status = status === "alert" ? "alert" : "warning";
    } else if (
      prev?.sslDays !== undefined &&
      ssl.daysRemaining !== undefined &&
      ssl.daysRemaining < (prev.sslDays as number)
    ) {
      alerts.push("SSL expiry window shortened");
      if (status === "ok") status = "warning";
    }
  }

  if (monitor.type === "UPTIME") {
    const reachable = await checkReachable(monitor.domain);
    snapshot.reachable = reachable;
    if (!reachable) {
      alerts.push("Host unreachable over HTTP(S)");
      status = "alert";
    }
  }

  return {
    status: alerts.length ? status : "ok",
    alerts,
    snapshot,
    checkedAt: new Date().toISOString(),
  };
}

export async function runAllMonitorChecks(): Promise<{ checked: number; alerts: number }> {
  const { prisma } = await import("../prisma");
  const monitors = await prisma.monitor.findMany({ where: { enabled: true } });
  let alerts = 0;
  for (const monitor of monitors) {
    try {
      const result = await runMonitorCheck(monitor);
      if (result.alerts.length) alerts += 1;
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { lastChecked: new Date(), lastResult: result as object },
      });
    } catch {
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          lastChecked: new Date(),
          lastResult: {
            status: "alert",
            alerts: ["Check failed"],
            snapshot: {},
            checkedAt: new Date().toISOString(),
          },
        },
      });
    }
  }
  return { checked: monitors.length, alerts };
}
