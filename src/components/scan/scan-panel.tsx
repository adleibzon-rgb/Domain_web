"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Skeleton } from "@/components/ui/badge";
import type { ScanResult } from "@/lib/types";
import Link from "next/link";

export function ScanPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [domain, setDomain] = useState(searchParams.get("domain") ?? "");
  const [scanId, setScanId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async (d: string) => {
    setError(null);
    setResult(null);
    setProgress(0);
    setStatus("starting");

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: d }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Scan failed");
      setStatus("failed");
      return;
    }

    setScanId(data.id);
    setStatus("running");
    router.replace(`/dashboard?domain=${encodeURIComponent(d)}`);

    if (data.cached) {
      const full = await fetch(`/api/scan/${data.id}`);
      const scan = await full.json();
      setResult(scan.result as ScanResult);
      setProgress(100);
      setStatus("completed");
      return;
    }

    const es = new EventSource(`/api/scan/${data.id}/stream`);
    es.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as {
        status: string;
        progress: number;
        result?: ScanResult;
        error?: string;
      };
      setProgress(msg.progress ?? 0);
      if (msg.status === "COMPLETED" && msg.result) {
        setResult(msg.result);
        setStatus("completed");
        es.close();
      }
      if (msg.status === "FAILED") {
        setError(msg.error ?? "Scan failed");
        setStatus("failed");
        es.close();
      }
    };
    es.onerror = () => es.close();
  }, [router]);

  useEffect(() => {
    const d = searchParams.get("domain");
    if (d && status === "idle") {
      setDomain(d);
      startScan(d);
    }
  }, [searchParams, status, startScan]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) startScan(domain.trim());
  };

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Enter domain — stripe.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={status === "running"}
        />
        <Button type="submit" disabled={status === "running"}>
          {status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {status === "running" ? `Scanning ${progress}%` : "Run scan"}
        </Button>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          {error}
        </div>
      )}

      {status === "running" && !result && (
        <div className="space-y-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      )}

      {result && (
        <ScanResults result={result} scanId={scanId} />
      )}
    </div>
  );
}

function ScanResults({ result, scanId }: { result: ScanResult; scanId: string | null }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{result.domain}</h2>
          <p className="text-sm text-zinc-500">Scanned {new Date(result.scannedAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {scanId && (
            <>
              <Button variant="secondary" size="sm" asChild>
                <a href={`/api/export?id=${scanId}&format=json`}>
                  <Download className="h-4 w-4" /> JSON
                </a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href={`/api/export?id=${scanId}&format=csv`}>
                  <Download className="h-4 w-4" /> CSV
                </a>
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/domain/${result.domain}`}>Full report</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="SSL" value={result.ssl.valid ? "Valid" : "Invalid"} ok={result.ssl.valid} />
        <MetricCard title="Security" value={result.security.grade} ok={result.security.score >= 60} />
        <MetricCard title="Uptime" value={result.uptime.reachable ? "Up" : "Down"} ok={result.uptime.reachable} />
        <MetricCard
          title="Latency"
          value={result.uptime.latencyMs ? `${result.uptime.latencyMs}ms` : "—"}
          ok={!!result.uptime.latencyMs}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>DNS records</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-auto text-sm">
            {result.dns.records.length === 0 ? (
              <p className="text-zinc-500">No records found</p>
            ) : (
              <ul className="space-y-2">
                {result.dns.records.map((r, i) => (
                  <li key={i} className="font-mono text-xs text-zinc-300">
                    <Badge className="mr-2">{r.type}</Badge>
                    {r.value}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security headers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-4xl font-bold">{result.security.score}</p>
            <div className="flex flex-wrap gap-2">
              {result.security.present.map((h) => (
                <Badge key={h} variant="success">
                  {h}
                </Badge>
              ))}
              {result.security.missing.slice(0, 4).map((h) => (
                <Badge key={h} variant="warning">
                  missing: {h}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geo / IP</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            {result.geo ? (
              <dl className="space-y-1">
                <div>
                  <dt className="text-zinc-500">IP</dt>
                  <dd className="font-mono">{result.geo.ip}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Location</dt>
                  <dd>
                    {[result.geo.city, result.geo.region, result.geo.country].filter(Boolean).join(", ")}
                  </dd>
                </div>
                {result.geo.isp && (
                  <div>
                    <dt className="text-zinc-500">ISP</dt>
                    <dd>{result.geo.isp}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-zinc-500">Geo lookup unavailable</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech & CDN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.tech.map((t) => (
                <Badge key={t.name}>{t.name}</Badge>
              ))}
              {result.cdnWaf.detected.map((c) => (
                <Badge key={c} variant="success">
                  {c}
                </Badge>
              ))}
              {result.tech.length === 0 && result.cdnWaf.detected.length === 0 && (
                <p className="text-zinc-500">No strong signals detected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, ok }: { title: string; value: string; ok: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-zinc-500">{title}</p>
        <p className={`mt-1 text-2xl font-bold ${ok ? "text-emerald-400" : "text-amber-400"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
