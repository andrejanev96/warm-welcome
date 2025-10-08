import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDemoUser() {
  const email = process.env.SEED_USER_EMAIL || "demo@warmwelcome.ai";
  const password = process.env.SEED_USER_PASSWORD || "WarmWelcome123!";
  const firstName = process.env.SEED_USER_FIRST_NAME || "Demo";
  const lastName = process.env.SEED_USER_LAST_NAME || "User";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⏭️  Skipped creating demo user (${email}) — already exists.`);
    return existing;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
    },
  });

  console.log(`✅ Created demo user (${email}) with password ${password}`);
  return user;
}

async function main() {
  console.log("🌱 Seeding database for WarmWelcome.ai...");

  await createDemoUser();

  console.log("🎉 Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
