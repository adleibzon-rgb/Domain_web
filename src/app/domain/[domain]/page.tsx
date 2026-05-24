import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScanResult } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return { title: domain };
}

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: raw } = await params;
  const domain = decodeURIComponent(raw);

  const scan = await prisma.scan.findFirst({
    where: { domain, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });

  if (!scan?.result) {
    notFound();
  }

  const result = scan.result as unknown as ScanResult;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-24">
      <h1 className="text-4xl font-bold">{result.domain}</h1>
      <p className="mt-2 text-zinc-400">Full analysis report</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>WHOIS</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto font-mono text-xs text-zinc-300">
            {Object.entries(result.whois).slice(0, 30).map(([k, v]) => (
              <div key={k} className="border-b border-white/5 py-1">
                <span className="text-zinc-500">{k}: </span>
                {v}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SSL certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Status:{" "}
              <Badge variant={result.ssl.valid ? "success" : "danger"}>
                {result.ssl.valid ? "Valid" : "Invalid"}
              </Badge>
            </p>
            {result.ssl.issuer && <p>Issuer: {result.ssl.issuer}</p>}
            {result.ssl.validTo && <p>Expires: {result.ssl.validTo}</p>}
            {result.ssl.daysRemaining !== undefined && (
              <p>Days remaining: {result.ssl.daysRemaining}</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>HTTP headers</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-auto font-mono text-xs">
            {Object.entries(result.http.headers).map(([k, v]) => (
              <div key={k} className="py-0.5">
                <span className="text-violet-400">{k}</span>: {v}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
