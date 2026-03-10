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
  const guestPassword = "KallnerGuest2026";

  const externalEmail = "grannen@example.com";
  const externalPassword = "Lösenord123";

  console.log("Rensar gammal data...");
  // Viktigt: Rensa i rätt ordning pga foreign key constraints
  await prisma.postIt.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();

  // 1. Skapa huvudgruppen "Kallner"
  console.log("Skapar gruppen Kallner...");
  const mainGroup = await prisma.group.create({
    data: { name: "Kallner" },
  });

  // 2. Skapa en extern grupp "Grannar" (för att testa filtrering)
  console.log("Skapar gruppen Grannar...");
  const externalGroup = await prisma.group.create({
    data: { name: "Grannar" },
  });

  // 3. Skapa Admin-användaren (Kallner Admin)
  console.log("Skapar admin...");
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Kallner Admin",
      password: hashedAdminPassword,
      role: "ADMIN",
      groups: {
        connect: { id: mainGroup.id }
      }
    },
  });
  console.log(`✅ Admin skapad: ${admin.name}`);

  // 4. Skapa Gäst-användaren (guest-kallner@outlook.com)
  console.log("Skapar gästkonto...");
  const hashedGuestPassword = await bcrypt.hash(guestPassword, 10);

  const guest = await prisma.user.create({
    data: {
      email: guestEmail,
      name: "Gäst (Kallner)",
      password: hashedGuestPassword,
      role: "GUEST",
      groups: {
        connect: { id: mainGroup.id }
      }
    },
  });
  console.log(`✅ Gästkonto skapat: ${guest.email}`);

  // 5. Skapa en Extern användare som INTE tillhör Kallner-gruppen
  console.log("Skapar extern användare...");
  const hashedExternalPassword = await bcrypt.hash(externalPassword, 10);

  const externalUser = await prisma.user.create({
    data: {
      email: externalEmail,
      name: "Grannen Grön",
      password: hashedExternalPassword,
      role: "USER",
      groups: {
        connect: { id: externalGroup.id } // Denna person är bara med i Grannar-gruppen
      }
    },
  });
  console.log(`✅ Extern användare skapad: ${externalUser.name}`);

  console.log("-----------------------------------------");
  console.log("🏁 SEEDING SLUTFÖRD!");
  console.log("-----------------------------------------");
  console.log(`Logga in som Admin/Gäst: Du ska SE varandra i listan.`);
  console.log(`Logga in som ${externalEmail}: Du ska INTE se Kallner-familjen.`);
  console.log("-----------------------------------------");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ SEEDING MISSLYCKADES:");
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });