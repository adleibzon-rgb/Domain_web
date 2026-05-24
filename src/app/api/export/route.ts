import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const format = req.nextUrl.searchParams.get("format") ?? "json";

  if (!id) {
    return NextResponse.json({ error: "Missing scan id" }, { status: 400 });
  }

  const scan = await prisma.scan.findUnique({ where: { id } });
  if (!scan?.result) {
    return NextResponse.json({ error: "Scan result not found" }, { status: 404 });
  }

  if (format === "csv") {
    const result = scan.result as Record<string, unknown>;
    const rows = [
      ["field", "value"],
      ["domain", scan.domain],
      ["scanned_at", String(result.scannedAt ?? "")],
      ["ssl_valid", String((result.ssl as { valid?: boolean })?.valid ?? "")],
      ["security_score", String((result.security as { score?: number })?.score ?? "")],
      ["security_grade", String((result.security as { grade?: string })?.grade ?? "")],
      ["uptime_reachable", String((result.uptime as { reachable?: boolean })?.reachable ?? "")],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${scan.domain}-scan.csv"`,
      },
    });
  }

  return NextResponse.json(scan.result, {
    headers: {
      "Content-Disposition": `attachment; filename="${scan.domain}-scan.json"`,
    },
  });
}
