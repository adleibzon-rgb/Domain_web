"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Download, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Stats = {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
  daily: { date: string; scans: number; completed: number }[];
  topDomains: { domain: string; count: number }[];
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const exportSummary = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "domain-scanner-analytics.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Analytics</h1>
          <p className="mt-2 text-zinc-400">
            Scan volume, success rate, and top domains — last 7 days.
          </p>
        </div>
        <Button variant="secondary" onClick={exportSummary} disabled={!stats}>
          <Download className="h-4 w-4" /> Export JSON
        </Button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total scans", value: stats?.total ?? "—" },
          { label: "Success rate", value: stats ? `${stats.successRate}%` : "—" },
          { label: "Failed", value: stats?.failed ?? "—" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-sm text-zinc-500">{kpi.label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Scans per day
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {stats?.daily.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="scans" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-zinc-500">
              Run scans from the dashboard to populate charts.
            </p>
          )}
        </CardContent>
      </Card>

      {stats?.topDomains.length ? (
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle>Top domains</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.topDomains.map((d) => (
                <li
                  key={d.domain}
                  className="flex justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                >
                  <span>{d.domain}</span>
                  <span className="text-zinc-500">{d.count} scans</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
