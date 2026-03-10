"use server"

import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import { sendPasswordResetEmail } from "@/lib/mail"

/**
 * Steg 1: Skapar en token och skickar återställningsmejlet
 */
export async function requestPasswordReset(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } })

    // Av säkerhetsskäl returnerar vi success även om e-postadressen inte finns
    if (!user) {
      return { success: true }
    }

    const token = uuidv4()
    const expires = new Date(Date.now() + 3600 * 1000) // 1 timme

    // Rensa eventuella gamla tokens för denna e-post och skapa en ny
    await db.passwordResetToken.deleteMany({ where: { email } })
    await db.passwordResetToken.create({
      data: { email, token, expires }
    })

    // Skicka mejlet via den centrala mail-funktionen
    const mailResult = await sendPasswordResetEmail(email, token)

    if (!mailResult) {
      return { error: "Kunde inte skicka återställningsmejlet just nu." }
    }

    return { success: true }
  } catch (error) {
    console.error("Request reset error:", error)
    return { error: "Ett oväntat fel uppstod vid förfrågan." }
  }
}

/**
 * Steg 2: Validerar token och uppdaterar användarens lösenord
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1. Kontrollera att token existerar
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token }
    })

    if (!existingToken) {
      return { error: "Ogiltig återställningslänk." }
    }

    // 2. Kontrollera om länken har gått ut
    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) {
      return { error: "Länken har gått ut. Vänligen begär en ny." }
    }

    // 3. Hitta användaren kopplad till denna token
    const user = await db.user.findUnique({
      where: { email: existingToken.email }
    })

    if (!user) {
      return { error: "Användaren hittades inte längre." }
    }

    // 4. Hasha det nya lösenordet
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Uppdatera lösenordet och radera använd token i en transaktion
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      db.passwordResetToken.delete({
        where: { id: existingToken.id }
      })
    ])

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Kunde inte uppdatera lösenordet. Försök igen." }
  }
}