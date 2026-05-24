"use client";

import { motion } from "framer-motion";
import { Database, Lock, Radio, Server } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "DNS & WHOIS depth",
    desc: "A/AAAA, MX, TXT, NS resolution plus registrar metadata in one pass.",
  },
  {
    icon: Lock,
    title: "SSL & security grade",
    desc: "Certificate validity, issuer chain, and security header scoring.",
  },
  {
    icon: Radio,
    title: "Live scan stream",
    desc: "SSE progress events while workers resolve each infrastructure layer.",
  },
  {
    icon: Server,
    title: "Self-hosted stack",
    desc: "PostgreSQL, Redis, Docker — your data stays on your VPS.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <h2 className="mb-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
        Built for operators
      </h2>
      <p className="mx-auto mb-16 max-w-2xl text-center text-zinc-400">
        Competitive tools scatter checks across tabs. Domain Scanner unifies infrastructure
        signals with export-ready reports and monitoring hooks.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-8"
          >
            <f.icon className="mb-4 h-8 w-8 text-violet-400" />
            <h3 className="text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-zinc-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
