import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [total, completed, failed, last7] = await Promise.all([
    prisma.scan.count(),
    prisma.scan.count({ where: { status: "COMPLETED" } }),
    prisma.scan.count({ where: { status: "FAILED" } }),
    prisma.scan.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const byDay = new Map<string, { scans: number; completed: number }>();
  for (const row of last7) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const cur = byDay.get(key) ?? { scans: 0, completed: 0 };
    cur.scans += 1;
    if (row.status === "COMPLETED") cur.completed += 1;
    byDay.set(key, cur);
  }

  const daily = [...byDay.entries()].map(([date, v]) => ({
    date,
    scans: v.scans,
    completed: v.completed,
  }));

  const topDomains = await prisma.scan.groupBy({
    by: ["domain"],
    _count: { domain: true },
    orderBy: { _count: { domain: "desc" } },
    take: 8,
  });

  return NextResponse.json({
    total,
    completed,
    failed,
    successRate: total ? Math.round((completed / total) * 100) : 0,
    daily,
    topDomains: topDomains.map((d) => ({
      domain: d.domain,
      count: d._count.domain,
    })),
  });
}
