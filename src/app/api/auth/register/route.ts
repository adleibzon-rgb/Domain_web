import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const seedEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const role =
    seedEmail && email === seedEmail ? ("ADMIN" as const) : ("USER" as const);

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name: body.name,
      passwordHash,
      role,
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
