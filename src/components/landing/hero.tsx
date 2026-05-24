"use client";

import { motion } from "framer-motion";
import { Search, Shield, Radar, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeDomain } from "@/lib/utils";

export function Hero() {
  const router = useRouter();
  const [domain, setDomain] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = normalizeDomain(domain);
    if (d) router.push(`/dashboard?domain=${encodeURIComponent(d)}`);
  };

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[100px]" />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-violet-300"
      >
        Domain intelligence platform
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl"
      >
        See every layer
        <br />
        <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
          of your domain
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl"
      >
        DNS, WHOIS, SSL, headers, geo, CDN detection, and security scoring — one scan,
        exportable reports, monitoring hooks for production teams.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onSubmit={submit}
        className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
      >
        <Input
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1 text-left"
        />
        <Button type="submit" size="lg" className="shrink-0">
          <Search className="h-4 w-4" />
          Analyze
        </Button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { icon: Radar, label: "DNS & WHOIS" },
          { icon: Shield, label: "SSL & headers" },
          { icon: Zap, label: "Live progress" },
          { icon: Search, label: "Export JSON/CSV" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
          >
            <Icon className="mb-2 h-5 w-5 text-violet-400" />
            <p className="text-sm text-zinc-300">{label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-12"
      >
        <Button variant="secondary" asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </motion.div>
    </section>
  );
}
