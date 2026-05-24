import dns from "node:dns/promises";
import tls from "node:tls";
import * as whois from "whois";
import { promisify } from "node:util";
import type { ScanResult, DnsRecord, SslInfo, SecurityHeaders, TechHint, GeoInfo } from "../types";

const whoisLookup = promisify(whois.lookup.bind(whois));

const SECURITY_HEADER_KEYS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
];

function parseWhois(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const k = line.slice(0, idx).trim().toLowerCase();
      const v = line.slice(idx + 1).trim();
      if (k && v && !k.startsWith("%")) out[k] = v;
    }
  }
  return out;
}

async function lookupDns(domain: string) {
  const records: DnsRecord[] = [];
  const nameservers: string[] = [];
  const mx: string[] = [];
  const txt: string[] = [];

  const types: Array<["A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS", () => Promise<unknown>]> = [
    ["A", () => dns.resolve4(domain)],
    ["AAAA", () => dns.resolve6(domain)],
    ["CNAME", () => dns.resolveCname(domain)],
    ["MX", () => dns.resolveMx(domain)],
    ["TXT", () => dns.resolveTxt(domain)],
    ["NS", () => dns.resolveNs(domain)],
  ];

  for (const [type, fn] of types) {
    try {
      const res = (await fn()) as unknown;
      if (type === "MX" && Array.isArray(res)) {
        for (const r of res as { exchange: string; priority: number }[]) {
          mx.push(`${r.priority} ${r.exchange}`);
          records.push({ type: "MX", value: `${r.priority} ${r.exchange}` });
        }
      } else if (type === "TXT" && Array.isArray(res)) {
        for (const r of res as string[][]) {
          const v = r.join("");
          txt.push(v);
          records.push({ type: "TXT", value: v });
        }
      } else if (type === "NS" && Array.isArray(res)) {
        for (const r of res as string[]) {
          nameservers.push(r);
          records.push({ type: "NS", value: r });
        }
      } else if (Array.isArray(res)) {
        for (const r of res as string[]) {
          records.push({ type, value: r });
        }
      }
    } catch {
      /* record type may not exist */
    }
  }

  return { records, nameservers, mx, txt };
}

async function checkSsl(domain: string): Promise<SslInfo> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, rejectUnauthorized: false, timeout: 10000 },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || !cert.valid_to) {
          resolve({ valid: false, error: "No certificate" });
          return;
        }
        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / 86400000);
        const issuer = cert.issuer?.O ?? cert.issuer?.CN;
        const subject = cert.subject?.CN;
        resolve({
          valid: daysRemaining > 0,
          issuer: Array.isArray(issuer) ? issuer[0] : issuer,
          subject: Array.isArray(subject) ? subject[0] : subject,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining,
          protocol: socket.getProtocol?.() ?? undefined,
        });
      }
    );
    socket.on("error", (e) => resolve({ valid: false, error: e.message }));
    socket.on("timeout", () => {
      socket.destroy();
      resolve({ valid: false, error: "Timeout" });
    });
  });
}

async function fetchHttp(domain: string) {
  const redirectChain: string[] = [];
  let url = `https://${domain}`;
  let status: number | undefined;
  const headers: Record<string, string> = {};

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    try {
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "DomainScanner/1.0 (+https://github.com/andrey271192/Domain_web)" },
      });
      status = res.status;
      res.headers.forEach((v, k) => {
        headers[k.toLowerCase()] = v;
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) break;
        redirectChain.push(loc);
        url = loc.startsWith("http") ? loc : new URL(loc, url).href;
        continue;
      }
      return {
        status,
        finalUrl: url,
        redirectChain,
        headers,
        server: headers["server"],
        poweredBy: headers["x-powered-by"],
        latencyMs: Date.now() - start,
      };
    } catch {
      try {
        url = `http://${domain}`;
        const res = await fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(15000),
        });
        status = res.status;
        res.headers.forEach((v, k) => {
          headers[k.toLowerCase()] = v;
        });
        return {
          status,
          finalUrl: res.url,
          redirectChain,
          headers,
          server: headers["server"],
          poweredBy: headers["x-powered-by"],
          latencyMs: Date.now() - start,
        };
      } catch {
        return { redirectChain, headers, reachable: false };
      }
    }
  }
  return { status, finalUrl: url, redirectChain, headers };
}

function scoreSecurityHeaders(headers: Record<string, string>): SecurityHeaders {
  const present: string[] = [];
  const missing: string[] = [];
  for (const key of SECURITY_HEADER_KEYS) {
    if (headers[key]) present.push(key);
    else missing.push(key);
  }
  const score = Math.round((present.length / SECURITY_HEADER_KEYS.length) * 100);
  const grade =
    score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  return { score, grade, present, missing, headers };
}

function detectTech(headers: Record<string, string>): TechHint[] {
  const tech: TechHint[] = [];
  const server = headers["server"]?.toLowerCase() ?? "";
  const powered = headers["x-powered-by"]?.toLowerCase() ?? "";
  const via = headers["via"]?.toLowerCase() ?? "";
  const cf = headers["cf-ray"];

  if (cf) tech.push({ name: "Cloudflare", category: "CDN", confidence: "high" });
  if (server.includes("nginx")) tech.push({ name: "nginx", category: "Web Server", confidence: "high" });
  if (server.includes("apache")) tech.push({ name: "Apache", category: "Web Server", confidence: "high" });
  if (server.includes("cloudflare")) tech.push({ name: "Cloudflare", category: "CDN", confidence: "high" });
  if (powered.includes("next")) tech.push({ name: "Next.js", category: "Framework", confidence: "medium" });
  if (powered.includes("express")) tech.push({ name: "Express", category: "Framework", confidence: "medium" });
  if (via.includes("varnish")) tech.push({ name: "Varnish", category: "Cache", confidence: "medium" });
  if (headers["x-vercel-id"]) tech.push({ name: "Vercel", category: "Hosting", confidence: "high" });
  if (headers["x-amz-cf-id"]) tech.push({ name: "AWS CloudFront", category: "CDN", confidence: "high" });

  const cdnWaf: string[] = [];
  if (cf) cdnWaf.push("Cloudflare");
  if (headers["x-served-by"]?.includes("fastly")) cdnWaf.push("Fastly");
  if (headers["server"]?.includes("Akamai")) cdnWaf.push("Akamai");

  return tech;
}

function detectCdnWaf(headers: Record<string, string>): string[] {
  const detected: string[] = [];
  if (headers["cf-ray"]) detected.push("Cloudflare");
  if (headers["x-fastly-request-id"]) detected.push("Fastly");
  if (headers["x-akamai-transformed"]) detected.push("Akamai");
  if (headers["x-amz-cf-id"]) detected.push("AWS CloudFront");
  if (headers["x-sucuri-id"]) detected.push("Sucuri WAF");
  return detected;
}

async function geoLookup(domain: string): Promise<GeoInfo | null> {
  try {
    const ips = await dns.resolve4(domain);
    const ip = ips[0];
    if (!ip) return null;

    const token = process.env.IPINFO_TOKEN;
    const url = token
      ? `https://ipinfo.io/${ip}?token=${token}`
      : `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,timezone,lat,lon,query`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = (await res.json()) as Record<string, unknown>;

    if (token) {
      const loc = String(data.loc ?? "").split(",");
      return {
        ip,
        country: data.country as string,
        region: data.region as string,
        city: data.city as string,
        org: data.org as string,
        timezone: data.timezone as string,
        lat: loc[0] ? Number(loc[0]) : undefined,
        lon: loc[1] ? Number(loc[1]) : undefined,
      };
    }

    if (data.status === "success") {
      return {
        ip: String(data.query ?? ip),
        country: data.country as string,
        region: data.regionName as string,
        city: data.city as string,
        isp: data.isp as string,
        org: data.org as string,
        timezone: data.timezone as string,
        lat: data.lat as number,
        lon: data.lon as number,
      };
    }
    return { ip };
  } catch {
    return null;
  }
}

export type ScanProgressCallback = (progress: number, stage: string) => void | Promise<void>;

export async function runDomainScan(
  domain: string,
  onProgress?: ScanProgressCallback
): Promise<ScanResult> {
  const report = async (p: number, stage: string) => {
    await onProgress?.(p, stage);
  };

  await report(5, "dns");
  const dnsResult = await lookupDns(domain);

  await report(25, "whois");
  let whoisData: Record<string, string> = {};
  try {
    const raw = await whoisLookup(domain);
    whoisData = parseWhois(String(raw));
  } catch (e) {
    whoisData = { error: e instanceof Error ? e.message : "WHOIS failed" };
  }

  await report(45, "ssl");
  const ssl = await checkSsl(domain);

  await report(65, "http");
  const httpRaw = await fetchHttp(domain);
  const headers = httpRaw.headers ?? {};
  const security = scoreSecurityHeaders(headers);
  const tech = detectTech(headers);
  const cdnWaf = { detected: detectCdnWaf(headers) };

  await report(85, "geo");
  const geo = await geoLookup(domain);

  await report(100, "done");

  return {
    domain,
    scannedAt: new Date().toISOString(),
    dns: dnsResult,
    whois: whoisData,
    ssl,
    http: {
      status: httpRaw.status,
      finalUrl: httpRaw.finalUrl,
      redirectChain: httpRaw.redirectChain ?? [],
      headers,
      server: httpRaw.server,
      poweredBy: httpRaw.poweredBy,
    },
    geo,
    security,
    tech,
    uptime: {
      reachable: typeof httpRaw.status === "number" && httpRaw.status < 500,
      latencyMs: "latencyMs" in httpRaw ? httpRaw.latencyMs : undefined,
    },
    cdnWaf,
  };
}
