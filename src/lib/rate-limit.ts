import { prisma } from "./prisma";

const LIMIT = Number(process.env.SCAN_RATE_LIMIT_PER_HOUR ?? 30);
const WINDOW_MS = 60 * 60 * 1000;

export async function checkRateLimit(key: string): Promise<{ ok: boolean; remaining: number }> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_MS);

  try {
    const row = await prisma.apiRateLimit.findUnique({ where: { key } });
    if (!row || row.windowEnd < now) {
      await prisma.apiRateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowEnd },
        update: { count: 1, windowEnd },
      });
      return { ok: true, remaining: LIMIT - 1 };
    }
    if (row.count >= LIMIT) {
      return { ok: false, remaining: 0 };
    }
    await prisma.apiRateLimit.update({
      where: { key },
      data: { count: row.count + 1 },
    });
    return { ok: true, remaining: LIMIT - row.count - 1 };
  } catch {
    return { ok: true, remaining: LIMIT };
  }
}
