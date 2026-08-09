/**
 * Seed script — buat admin user pertama
 * Jalankan: node prisma/seed.js
 *
 * Script ini akan:
 * 1. Generate bcrypt hash dari password yang kamu tentukan
 * 2. Insert admin user ke tabel admin_users di Neon
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // ─── KONFIGURASI — Ganti sebelum menjalankan ──────────────────────────
  const ADMIN_NAME = "Administrator";
  const ADMIN_EMAIL = "admin@absensitukang.com";
  const ADMIN_PASSWORD = "Admin@1234"; // Ganti dengan password yang kuat!
  // ───────────────────────────────────────────────────────────────────────

  console.log("⏳ Generating password hash...");
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  console.log("⏳ Creating admin user...");
  const user = await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, password: hashedPassword },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
    },
  });

  console.log("✅ Admin user created/updated:");
  console.log(`   Name  : ${user.name}`);
  console.log(`   Email : ${user.email}`);
  console.log(`   ID    : ${user.id}`);
  console.log("\n🚀 Sekarang login dengan:");
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
