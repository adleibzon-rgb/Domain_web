import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const envVars = [
  {
    name: "DATABASE_URL",
    desc: "PostgreSQL connection string for scans, users, and monitors.",
  },
  {
    name: "REDIS_URL",
    desc: "Redis for scan queue workers (optional on small VPS).",
  },
  {
    name: "NEXTAUTH_SECRET",
    desc: "Session encryption secret — rotate after deploy if leaked.",
  },
  {
    name: "NEXTAUTH_URL",
    desc: "Public app URL (e.g. http://your-server-ip).",
  },
  {
    name: "IPINFO_TOKEN",
    desc: "Optional token for richer geo/IP enrichment.",
  },
  {
    name: "SCAN_RATE_LIMIT_PER_HOUR",
    desc: "Per-IP scan throttle (default from .env.example).",
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-24">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Settings</h1>
      <p className="mt-2 text-zinc-400">
        Server configuration lives in environment variables. Theme toggle is in the header.
      </p>

      <div className="mt-10 space-y-4">
        {envVars.map((v) => (
          <Card key={v.name} className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 font-mono text-base">
                {v.name}
                <Badge variant="default">.env</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">{v.desc}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass mt-8">
        <CardHeader>
          <CardTitle>Account & monitoring</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Sign in / Register</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/monitoring">Monitors</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
