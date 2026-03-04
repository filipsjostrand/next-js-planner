import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL

declare global {
  var prisma: PrismaClient | undefined
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Vi skapar klienten med adaptern för att köra via pg-pool (bra för serverless)
export const db = global.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") global.prisma = db