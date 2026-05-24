"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Plus } from "lucide-react";
import { toast } from "sonner";

export default function MonitoringPage() {
  const [domain, setDomain] = useState("");
  const [monitors, setMonitors] = useState<
    { id: string; domain: string; type: string }[]
  >([]);

  const addMonitor = async () => {
    const res = await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, type: "DNS" }),
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
    setMonitors((m) => [...m, data.monitor]);
    setDomain("");
    toast.success("Monitor created (cron worker: roadmap)");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <h1 className="text-4xl font-bold">Monitoring</h1>
      <p className="mt-2 text-zinc-400">
        DNS and SSL change alerts — queue workers ship in v1.1.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Add monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="domain.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button onClick={addMonitor}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      {monitors.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <Bell className="h-8 w-8 text-zinc-600" />
          </div>
          <p className="text-zinc-500">No monitors yet. Add one to track DNS/SSL changes.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {monitors.map((m) => (
            <li key={m.id} className="glass rounded-xl px-4 py-3">
              {m.domain} — {m.type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
