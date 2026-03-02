"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Vi skapar ett fast ID så att databas-relationerna fortfarande fungerar
const TEMP_USER_ID = "user-1"

/**
 * SKAPA NY UPPGIFT
 */
export async function createTodo(data: { title: string; date: string; time: string; color: string }) {
  try {
    await db.todo.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time,
        color: data.color,
        userId: TEMP_USER_ID, // Använder vårt fejkade ID
        completed: false,
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
 * TOGGLA STATUS
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
    return { error: "Kunde inte radera uppgiften." }
  }
}

// _ _ _

// 2026-03-02 rev00 - Inloggningskrav stoppar dev

// "use server"

// import { db } from "@/lib/db"
// import { auth } from "@/auth" // Eller din konfigurerade auth-sökväg
// import { revalidatePath } from "next/cache"

// /**
//  * SKAPA NY UPPGIFT
//  */
// export async function createTodo(data: { title: string; date: string; time: string; color: string }) {
//   const session = await auth()

//   if (!session?.user?.id) {
//     return { error: "Du måste vara inloggad." }
//   }

//   try {
//     await db.todo.create({
//       data: {
//         title: data.title,
//         date: data.date,
//         time: data.time,
//         color: data.color,
//         userId: session.user.id,
//         completed: false,
//       },
//     })

//     revalidatePath("/")
//     return { success: true }
//   } catch (error) {
//     console.error("Database error:", error)
//     return { error: "Kunde inte spara uppgiften i databasen." }
//   }
// }

// /**
//  * TOGGLA STATUS (KLAR / EJ KLAR)
//  */
// export async function toggleTodo(id: string, completed: boolean) {
//   const session = await auth()

//   if (!session?.user?.id) return { error: "Ej behörig." }

//   try {
//     // Vi lägger till userId i 'where' för extra säkerhet
//     await db.todo.update({
//       where: {
//         id,
//         userId: session.user.id
//       },
//       data: {
//         completed: !completed
//       },
//     })

//     revalidatePath("/")
//     return { success: true }
//   } catch (error) {
//     return { error: "Kunde inte uppdatera status." }
//   }
// }

// /**
//  * RADERA UPPGIFT
//  */
// export async function deleteTodo(id: string) {
//   const session = await auth()

//   if (!session?.user?.id) return { error: "Ej behörig." }

//   try {
//     // Kontrollera att todon tillhör användaren innan radering
//     await db.todo.delete({
//       where: {
//         id,
//         userId: session.user.id
//       },
//     })

//     revalidatePath("/")
//     return { success: true }
//   } catch (error) {
//     return { error: "Kunde inte radera uppgiften." }
//   }
// }