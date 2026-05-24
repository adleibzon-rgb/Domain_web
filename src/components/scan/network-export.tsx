"use client";

import { useMemo, useState } from "react";
import { Download, ChevronDown, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScanResult } from "@/lib/types";

type ExportKind = "ip-list" | "dns-hosts" | "infra-json";

function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildIpList(result: ScanResult): string {
  const ips = new Set<string>();
  if (result.geo?.ip) ips.add(result.geo.ip);
  for (const r of result.dns.records) {
    if (r.type === "A" || r.type === "AAAA") ips.add(r.value);
  }
  return [...ips].join("\n") + (ips.size ? "\n" : "");
}

function buildHostsFile(result: ScanResult): string {
  const lines: string[] = [
    `# Infrastructure hosts — ${result.domain}`,
    `# Generated ${result.scannedAt}`,
    "",
  ];
  for (const r of result.dns.records) {
    if (r.type === "A" || r.type === "AAAA") {
      lines.push(`${r.value}\t${result.domain}`);
    }
  }
  if (result.geo?.ip && !lines.some((l) => l.startsWith(result.geo!.ip))) {
    lines.push(`${result.geo.ip}\t${result.domain}`);
  }
  return lines.join("\n") + "\n";
}

function buildInfraBundle(result: ScanResult): string {
  return JSON.stringify(
    {
      domain: result.domain,
      scannedAt: result.scannedAt,
      network: {
        ips: buildIpList(result).trim().split("\n").filter(Boolean),
        dns: result.dns.records,
        nameservers: result.dns.nameservers,
        mx: result.dns.mx,
      },
      edge: {
        cdnWaf: result.cdnWaf.detected,
        tech: result.tech,
        httpStatus: result.http.status,
        finalUrl: result.http.finalUrl,
      },
      geo: result.geo,
    },
    null,
    2
  );
}

const OPTIONS: { id: ExportKind; label: string; desc: string; ext: string }[] = [
  {
    id: "ip-list",
    label: "IP address list",
    desc: "Plain text — A/AAAA + resolved IP",
    ext: "txt",
  },
  {
    id: "dns-hosts",
    label: "Hosts-style DNS map",
    desc: "IP ↔ hostname lines for tooling",
    ext: "hosts",
  },
  {
    id: "infra-json",
    label: "Infrastructure bundle",
    desc: "DNS, edge, geo subset (not geoip presets)",
    ext: "json",
  },
];

export function NetworkExport({ result }: { result: ScanResult }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ExportKind>("ip-list");

  const preview = useMemo(() => {
    if (kind === "ip-list") return buildIpList(result).slice(0, 400);
    if (kind === "dns-hosts") return buildHostsFile(result).slice(0, 400);
    return buildInfraBundle(result).slice(0, 400);
  }, [kind, result]);

  const exportFile = () => {
    const opt = OPTIONS.find((o) => o.id === kind)!;
    const base = `${result.domain}-network`;
    if (kind === "ip-list") {
      downloadText(`${base}-ips.${opt.ext}`, buildIpList(result));
    } else if (kind === "dns-hosts") {
      downloadText(`${base}.${opt.ext}`, buildHostsFile(result));
    } else {
      downloadText(`${base}.${opt.ext}`, buildInfraBundle(result), "application/json");
    }
  };

  return (
    <Card className="border-violet-500/20">
      <CardHeader className="cursor-pointer" onClick={() => setOpen(!open)}>
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <Network className="h-5 w-5 text-violet-400" />
            Network export
          </span>
          <ChevronDown
            className={`h-5 w-5 text-zinc-500 transition ${open ? "rotate-180" : ""}`}
          />
        </CardTitle>
        <p className="text-sm font-normal text-zinc-500">
          Export resolved IPs and DNS from this scan — infrastructure report, not routing presets.
        </p>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 border-t border-white/5 pt-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setKind(o.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  kind === o.id
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <p className="text-sm font-medium text-zinc-200">{o.label}</p>
                <p className="mt-1 text-xs text-zinc-500">{o.desc}</p>
              </button>
            ))}
          </div>
          <pre className="max-h-40 overflow-auto rounded-xl bg-black/40 p-3 font-mono text-xs text-zinc-400">
            {preview}
            {preview.length >= 400 ? "\n…" : ""}
          </pre>
          <Button type="button" onClick={exportFile}>
            <Download className="h-4 w-4" />
            Download {OPTIONS.find((o) => o.id === kind)?.label}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
