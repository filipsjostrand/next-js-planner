"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
  if (!session || !session.user) {
    return { success: false, error: "Du måste vara inloggad" };
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

export async function toggleTodo(id: string, completed: boolean) {
  const session = await auth();
  if (!session || !session.user) {
    return { success: false, error: "Ej inloggad" };
  }

  try {
    const todo = await db.todo.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!todo) {
      return { success: false, error: "Uppgiften hittades inte" };
    }

    const user = session.user as { id: string, role?: string };
    const isOwner = todo.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Behörighet saknas" };
    }

    await db.todo.update({
      where: { id },
      data: { completed },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Fel vid uppdatering:", error);
    return { success: false, error: "Kunde inte uppdatera status" };
  }
}

export async function deleteTodo(id: string) {
  const session = await auth();
  if (!session || !session.user) {
    return { success: false, error: "Ej inloggad" };
  }

  try {
    // 1. Hitta todon för att se vem den tillhör
    const todo = await db.todo.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!todo) {
      return { success: false, error: "Uppgiften hittades inte" };
    }

    // 2. Kontrollera behörighet
    const user = session.user as { id: string, role?: string };
    const isOwner = todo.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Du har inte behörighet att ta bort denna uppgift" };
    }

    // 3. Radera
    await db.todo.delete({
      where: { id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Fel vid borttagning av todo:", error);
    return { success: false, error: "Något gick fel vid borttagning" };
  }
}