"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
// Vi hämtar Enumen direkt från din genererade klient för att slippa "any"
import { RecurrenceType } from "@prisma/client"

// Definiera en typ för den inkommande datan som matchar databasens schema
interface CreateTodoInput {
  title: string
  date: string
  time: string | null
  color: string
  recurrence: RecurrenceType // Använder Prismas egna typ istället för string
  interval: number
  daysOfWeek: string | null
  userId: string // Dynamiskt ID från sessionen
}

/**
 * SKAPA NY UPPGIFT
 */
export async function createTodo(data: CreateTodoInput) {
  try {
    await db.todo.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time,
        color: data.color,
        userId: data.userId,
        completed: false,
        recurrence: data.recurrence, // Nu typ-säkert utan as any
        interval: data.interval,
        daysOfWeek: data.daysOfWeek,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Database error:", error)
    return { error: "Kunde inte spara uppgiften." }
  }
}

/**
 * TOGGLA STATUS (Slutförd / Ej slutförd)
 */
export async function toggleTodo(id: string, completed: boolean) {
  try {
    await db.todo.update({
      where: { id },
      data: { completed: !completed },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Database error:", error)
    return { error: "Kunde inte uppdatera status." }
  }
}

/**
 * RADERA UPPGIFT
 */
export async function deleteTodo(id: string) {
  try {
    await db.todo.delete({
      where: { id },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Database error:", error)
    return { error: "Kunde inte radera uppgiften." }
  }
}