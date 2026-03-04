"use server"

import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { resend } from "@/lib/resend"
import bcrypt from "bcryptjs"

export async function requestPasswordReset(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Vi returnerar success ändå för att inte avslöja om en e-post finns
      return { success: true }
    }

    const token = uuidv4()
    const expires = new Date(Date.now() + 3600 * 1000) // 1 timme

    await db.passwordResetToken.deleteMany({ where: { email } })
    await db.passwordResetToken.create({
      data: { email, token, expires }
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/new-password?token=${token}`

    await resend.emails.send({
      from: "Källner Planering <onboarding@resend.dev>",
      to: email,
      subject: "Återställ ditt lösenord",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hej ${user.name || 'där'}!</h2>
          <p>Vi har tagit emot en begäran om att återställa lösenordet för ditt konto på Källner Planering.</p>
          <p>Klicka på knappen nedan för att välja ett nytt lösenord. Länken är giltig i en timme.</p>
          <a href="${resetLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">
            Återställ lösenord
          </a>
        </div>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Resend error:", error)
    return { error: "Kunde inte skicka mejlet. Försök igen senare." }
  }
}

// DENNA FUNKTION SAKNADES I DIN FIL:
export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1. Hitta token
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token }
    })

    if (!existingToken) {
      return { error: "Ogiltig återställningslänk." }
    }

    // 2. Kolla utgångsdatum
    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) {
      return { error: "Länken har gått ut. Vänligen begär en ny." }
    }

    // 3. Hitta användaren
    const user = await db.user.findUnique({
      where: { email: existingToken.email }
    })

    if (!user) {
      return { error: "Användaren hittades inte." }
    }

    // 4. Hasha det nya lösenordet
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Uppdatera användaren och radera token (Transaction)
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
    return { error: "Kunde inte uppdatera lösenordet." }
  }
}