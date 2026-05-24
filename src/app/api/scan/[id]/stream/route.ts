import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let attempts = 0;
      const maxAttempts = 120;

      const poll = async () => {
        const scan = await prisma.scan.findUnique({ where: { id } });
        if (!scan) {
          send({ error: "not_found" });
          controller.close();
          return;
        }

        send({
          id: scan.id,
          status: scan.status,
          progress: scan.progress,
          domain: scan.domain,
          result: scan.status === "COMPLETED" ? scan.result : undefined,
          error: scan.error,
        });

        if (scan.status === "COMPLETED" || scan.status === "FAILED") {
          controller.close();
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          send({ error: "timeout" });
          controller.close();
          return;
        }

        setTimeout(poll, 1000);
      };

      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
