"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createTodo(formData: {
  title: string
  date: string
  time?: string
  color?: string
  userId: string
}) {
  const session = await auth()

  // Säkerhetskoll: Loggad in? Inte gäst?
  if (!session || !session.user || session.user.role === "GUEST") {
    throw new Error("Obehörig: Gäster kan inte skapa todos.")
  }

  try {
    await db.todo.create({
      data: {
        title: formData.title,
        date: formData.date,
        time: formData.time || null,
        color: formData.color || "default",
        userId: formData.userId,
      },
    })

    // Uppdatera sidan så att den nya todon syns direkt
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Fel vid skapande av todo:", error)
    return { error: "Kunde inte spara todon." }
  }
}