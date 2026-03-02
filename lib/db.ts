import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../app/generated/prisma/client" // Dubbelkolla att denna väg stämmer

// 1. Skapa en anslutnings-pool med din URL från .env
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// 2. Hantera global instans för att undvika för många anslutningar i Next.js (Hot Reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// 3. Skicka in adaptern till PrismaClient-konstruktorn
export const db =
  globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db

// import { Pool } from "pg";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../app/generated/prisma/client";

// // Skapa en anslutningspool mot Neon
// const connectionString = process.env.DATABASE_URL;
// const pool = new Pool({ connectionString });
// const adapter = new PrismaPg(pool);

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// // Skicka med adaptern till PrismaClient!
// export const db =
//   globalForPrisma.prisma || new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// _ _ _

// import { PrismaClient } from "@prisma/client"

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// export const db = globalForPrisma.prisma || new PrismaClient()

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db