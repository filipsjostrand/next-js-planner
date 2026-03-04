import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL saknas i .env");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Startar seeding...");

  const adminEmail = "plan-kallner@outlook.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Plan1337!";

  const guestEmail = "guest-kallner@outlook.com";
  const guestPassword = "KallnerGuest2026"; // Detta matchar knappen i din login-sida

  console.log("Rensar gammal data...");
  await prisma.postIt.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();

  // 1. Skapa huvudgruppen "Kallner"
  console.log("Skapar gruppen Kallner...");
  const mainGroup = await prisma.group.create({
    data: { name: "Kallner" },
  });

  // 2. Skapa Admin-användaren (Kallner Admin)
  console.log("Skapar admin...");
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Kallner Admin",
      password: hashedAdminPassword,
      role: "ADMIN",
      group: {
        connect: { id: mainGroup.id }
      }
    },
  });
  console.log(`✅ Admin skapad: ${admin.name}`);

  // 3. Skapa Gäst-användaren (guest-kallner@outlook.com)
  console.log("Skapar gästkonto...");
  const hashedGuestPassword = await bcrypt.hash(guestPassword, 10);

  const guest = await prisma.user.create({
    data: {
      email: guestEmail,
      name: "Gäst (Kallner)",
      password: hashedGuestPassword,
      role: "GUEST",
      group: {
        connect: { id: mainGroup.id }
      }
    },
  });
  console.log(`✅ Gästkonto skapat: ${guest.email}`);

  console.log("-----------------------------------------");
  console.log("🏁 SEEDING SLUTFÖRD!");
  console.log("-----------------------------------------");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end(); // Stänger poolen för att scriptet ska avslutas snyggt
  })
  .catch(async (e) => {
    console.error("❌ SEEDING MISSLYCKADES:");
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });