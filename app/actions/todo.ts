"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Vi definierar sträng-literals istället för att importera Enumen
// Det gör koden mer tålig mot ändringar i Prisma-klienten
interface CreateTodoInput {
  title: string;
  date: string;
  time?: string | null;
  color: string;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  daysOfWeek?: string | null;
  userId: string;
}

export async function createTodo(data: CreateTodoInput) {
  const session = await auth();

  if (!session) {
    throw new Error("Du måste vara inloggad");
  }

  try {
    const todo = await db.todo.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time || null,
        color: data.color,
        completed: false,
        recurrence: data.recurrence,
        interval: data.interval,
        daysOfWeek: data.daysOfWeek || null,
        userId: data.userId,
      },
    });

    revalidatePath("/");
    return { success: true, todo };
  } catch (error) {
    console.error("Fel vid skapande av todo:", error);
    return { success: false, error: "Kunde inte skapa uppgiften" };
  }
}

// Denna funktion heter nu toggleTodo för att matcha importen i din weekly-view.tsx
export async function toggleTodo(id: string, completed: boolean) {
  try {
    await db.todo.update({
      where: { id },
      data: { completed },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Fel vid uppdatering av status:", error);
    return { success: false };
  }
}

export async function deleteTodo(id: string) {
  try {
    await db.todo.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Fel vid borttagning av todo:", error);
    return { success: false };
  }
}