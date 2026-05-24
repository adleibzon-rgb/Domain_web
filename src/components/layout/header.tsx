"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Globe2, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/monitoring", label: "Monitoring" },
  { href: "/analytics", label: "Analytics" },
  { href: "/api-docs", label: "API" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
            <Globe2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Domain Scanner</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                pathname.startsWith(l.href) &&
                  "bg-zinc-100 text-zinc-900 dark:bg-white/5 dark:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard">Start scan</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-zinc-200 bg-white p-4 dark:border-white/5 dark:bg-zinc-950 md:hidden"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-zinc-300"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" className="mt-2 block">
            <Button className="w-full">Start scan</Button>
          </Link>
        </motion.div>
      )}
    </header>
  );
}
