"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * SKAPA ELLER UPPDATERA POST-IT
 * Vi använder 'upsert' så att den skapar en ny om ID saknas,
 * annars uppdaterar den befintlig.
 */
export async function savePostIt(id: string, content: string, userId: string, color: string) {
  try {
    await db.postIt.upsert({
      where: { id: id },
      update: { content: content },
      create: {
        id: id,
        content: content,
        userId: userId,
        color: color,
      },
    })
    // Vi revaliderar inte här för varje bokstav som skrivs (prestanda),
    // men vi gör det för att säkerställa att datan finns där.
    return { success: true }
  } catch (error) {
    console.error("Database error (Post-it):", error)
    return { error: "Kunde inte spara anteckningen." }
  }
}

/**
 * RADERA POST-IT
 */
export async function deletePostIt(id: string) {
  try {
    await db.postIt.delete({
      where: { id },
    })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Database error (Post-it):", error)
    return { error: "Kunde inte radera anteckningen." }
  }
}