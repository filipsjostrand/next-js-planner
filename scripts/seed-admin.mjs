// 1. Vi importerar från din anpassade genererade mapp istället för node_modules
import pkg from '../app/generated/prisma/index.js';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "plan-kallner@outlook.com";
  const plainPassword = "Plan1337!";

  console.log("--- 🏁 STARTAR SEEDING AV ADMIN ---");

  try {
    // Vi hashar lösenordet så att Auth.js kan läsa det
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Vi använder 'upsert' så att vi inte får dubbletter om du kör skriptet igen
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
      create: {
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    console.log("-----------------------------------------");
    console.log(`✅ SUCCESS: Admin skapad/uppdaterad!`);
    console.log(`📧 E-post: ${admin.email}`);
    console.log(`🔐 Lösenord: ${plainPassword}`);
    console.log(`🛡️  Roll: ${admin.role}`);
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("❌ ERROR vid seeding:");
    console.error(error);

    if (error.message.includes("Cannot find module")) {
      console.log("\n💡 TIPS: Kör 'npx prisma generate' först!");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();