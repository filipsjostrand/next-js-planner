"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations/auth"
import { z } from "zod"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { Prisma } from "@prisma/client"

export async function register(values: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Ogiltiga fält" }
  }

  const { email, password, name, groupName, role } = validatedFields.data

  try {
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "E-postadressen används redan" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userData: Prisma.UserCreateInput = {
      name,
      email,
      password: hashedPassword,
      role: (role as "USER" | "GUEST") || "USER",
      emailVerified: null,
    }

    // Koppla till grupp ENDAST om ett namn faktiskt angetts och inte är tomt
    if (groupName && groupName.trim() !== "") {
      const trimmedGroupName = groupName.trim()

      userData.groups = {
        connectOrCreate: {
          where: { name: trimmedGroupName },
          create: { name: trimmedGroupName }
        }
      }
    }

    // 1. Skapa användaren
    await db.user.create({
      data: userData
    })

    // 2. Generera token
    const verificationToken = await generateVerificationToken(email)

    // 3. Skicka mejl
    // Vi använder 'email' direkt från de validerade fälten för att vara 100% säkra
    // på att vi har en mottagare, ifall token-objektet har andra fältnamn (identifier/email).
    await sendVerificationEmail(
      email,
      verificationToken.token
    )

    return { success: "Verifieringsmail skickat! Kolla din inkorg för att aktivera kontot." }

  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Något gick fel vid registreringen." }
  }
}