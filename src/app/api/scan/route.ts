import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeDomain, isValidDomain } from "@/lib/utils";
import { runDomainScan } from "@/lib/scanner";
import { cacheGet, cacheSet } from "@/lib/redis";

const bodySchema = z.object({
  domain: z.string().min(1).max(253),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rate = await checkRateLimit(`scan:${ip}`);
  if (!rate.ok) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const domain = normalizeDomain(body.domain);
  if (!isValidDomain(domain)) {
    return NextResponse.json({ error: "Invalid domain name" }, { status: 400 });
  }

  const cacheKey = `scan:result:${domain}`;
  const cached = await cacheGet<object>(cacheKey);
  if (cached) {
    const scan = await prisma.scan.create({
      data: {
        domain,
        status: "COMPLETED",
        progress: 100,
        result: cached,
        ip,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });
    return NextResponse.json({ id: scan.id, domain, cached: true });
  }

  const scan = await prisma.scan.create({
    data: {
      domain,
      status: "RUNNING",
      progress: 0,
      ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
    },
  });

  runScanAsync(scan.id, domain, cacheKey);

  return NextResponse.json({ id: scan.id, domain });
}

async function runScanAsync(scanId: string, domain: string, cacheKey: string) {
  try {
    const result = await runDomainScan(domain, async (progress) => {
      await prisma.scan.update({ where: { id: scanId }, data: { progress } });
    });
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "COMPLETED", progress: 100, result: result as object },
    });
    await cacheSet(cacheKey, result, 3600);
  } catch (e) {
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "FAILED",
        error: e instanceof Error ? e.message : "Scan failed",
      },
    });
  }
}

export async function GET(req: NextRequest) {
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 50);
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      domain: true,
      status: true,
      progress: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ scans });
}
