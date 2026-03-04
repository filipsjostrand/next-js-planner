"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations/auth"
import { z } from "zod"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export async function register(values: z.infer<typeof registerSchema>) {
  // 1. Validera fält på serversidan med Zod
  const validatedFields = registerSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Ogiltiga fält" }
  }

  const { email, password, name, groupName, role } = validatedFields.data

  try {
    // 2. Kontrollera om användaren redan finns (gör detta tidigt för att spara resurser)
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "E-postadressen används redan" }
    }

    // 3. Hantera gruppen (Hämta eller skapa om den inte finns)
    let existingGroup = await db.group.findFirst({
      where: {
        name: {
          equals: groupName.trim(),
          mode: "insensitive", // Gör sökningen okänslig för stora/små bokstäver
        },
      },
    })

    if (!existingGroup) {
      existingGroup = await db.group.create({
        data: {
          name: groupName.trim(),
        }
      })
    }

    // 4. Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Skapa användaren i databasen
    // Vi sätter emailVerified till null explicit för att blockera inloggning (enligt auth.ts)
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as "USER" | "GUEST",
        groupId: existingGroup.id,
        emailVerified: null,
      }
    })

    // 6. Generera verifieringstoken
    const verificationToken = await generateVerificationToken(email)

    // 7. Skicka verifieringsmailet
    // Kontrollera om din token-modell använder 'identifier' eller 'email'
    await sendVerificationEmail(
      verificationToken.identifier || email,
      verificationToken.token
    )

    return { success: "Verifieringsmail skickat! Kolla din inkorg för att aktivera kontot." }

  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Något gick fel vid registreringen. Försök igen senare." }
  }
}