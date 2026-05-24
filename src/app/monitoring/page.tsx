"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, RefreshCw, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import type { MonitorLastResult } from "@/lib/monitoring/check";

type MonitorRow = {
  id: string;
  domain: string;
  type: string;
  enabled: boolean;
  lastChecked: string | null;
  lastResult: MonitorLastResult | null;
};

function statusBadge(result: MonitorLastResult | null) {
  if (!result) return <Badge variant="warning">Pending</Badge>;
  if (result.status === "alert") return <Badge variant="danger">Alert</Badge>;
  if (result.status === "warning") return <Badge variant="warning">Warning</Badge>;
  return <Badge variant="success">OK</Badge>;
}

export default function MonitoringPage() {
  const [domain, setDomain] = useState("");
  const [type, setType] = useState<"DNS" | "SSL" | "UPTIME">("DNS");
  const [monitors, setMonitors] = useState<MonitorRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/monitors");
    if (res.status === 401) {
      setMonitors([]);
      setLoading(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setMonitors(data.monitors ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addMonitor = async () => {
    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, type }),
    });
    if (res.status === 401) {
      toast.error("Sign in to add monitors");
      return;
    }
    if (!res.ok) {
      toast.error("Could not create monitor");
      return;
    }
    const data = await res.json();
    setMonitors((m) => [data.monitor, ...m]);
    setDomain("");
    toast.success("Monitor added — worker checks every ~5 min");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Monitoring</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          DNS change detection and SSL expiry alerts. Background worker runs on your VPS.
        </p>
      </motion.div>

      <Card className="glass mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Add monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="domain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="h-10 rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <option value="DNS">DNS</option>
            <option value="SSL">SSL</option>
            <option value="UPTIME">Uptime</option>
          </select>
          <Button onClick={addMonitor} disabled={!domain.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {loading ? "Loading…" : `${monitors.length} monitor(s)`}
        </p>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {!loading && monitors.length === 0 && (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
            <Bell className="h-8 w-8 text-violet-400" />
          </div>
          <p className="text-zinc-500">No monitors yet.</p>
          <p className="mt-2 text-sm text-zinc-500">
            <Link href="/login" className="text-violet-500 hover:underline">
              Sign in
            </Link>{" "}
            to track domains.
          </p>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {monitors.map((m, i) => (
          <motion.li
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.domain}</p>
                <p className="text-sm text-zinc-500">{m.type} monitor</p>
              </div>
              {statusBadge(m.lastResult)}
            </div>
            {m.lastResult?.alerts?.length ? (
              <ul className="mt-3 space-y-1 text-sm text-amber-600 dark:text-amber-300">
                {m.lastResult.alerts.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            ) : m.lastResult ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> No issues on last check
              </p>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                <AlertTriangle className="h-4 w-4" /> Awaiting first worker run
              </p>
            )}
            {m.lastChecked && (
              <p className="mt-2 text-xs text-zinc-500">
                Last checked {new Date(m.lastChecked).toLocaleString()}
              </p>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
