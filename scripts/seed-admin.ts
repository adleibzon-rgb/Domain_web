import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("[seed-admin] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skip");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, role: "ADMIN", name: "Admin" },
    update: { passwordHash, role: "ADMIN" },
  });
  console.log(`[seed-admin] admin ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
