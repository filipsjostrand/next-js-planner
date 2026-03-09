"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

interface CreateTodoInput {
  title: string;
  date: string;
  time?: string | null;
  endTime?: string | null;
  color: string;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  daysOfWeek?: string | null;
  userId: string;
  allInGroup?: boolean;
}

interface UpdateTodoInput extends Partial<CreateTodoInput> {
  updateAllInGroup?: boolean;
}

/**
 * Kontrollerar behörighet.
 * Tillåter ändring om användaren är ägare, admin ELLER tillhör samma grupp som todon.
 */
async function checkPermission(todoId: string) {
  const session = await auth();
  if (!session || !session.user) return { allowed: false, error: "Ej inloggad" };

  // Hämta todon och inkludera skaparens gruppId
  const todo = await db.todo.findUnique({
    where: { id: todoId },
    include: {
      user: {
        select: { groupId: true }
      }
    }
  });

  if (!todo) return { allowed: false, error: "Uppgiften hittades inte" };

  // Hämta den inloggade användarens aktuella gruppId
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, groupId: true }
  });

  if (!currentUser) return { allowed: false, error: "Användaren hittades inte" };

  const isOwner = todo.userId === currentUser.id;
  const isAdmin = currentUser.role === "ADMIN";
  const isInSameGroup = currentUser.groupId && currentUser.groupId === todo.user.groupId;

  // Om användaren varken är ägare, admin eller i samma grupp -> Neka
  if (!isOwner && !isAdmin && !isInSameGroup) {
    return { allowed: false, error: "Behörighet saknas" };
  }

  return {
    allowed: true,
    userId: currentUser.id,
    groupIdentifier: todo.groupIdentifier
  };
}

export async function createTodo(data: CreateTodoInput) {
  const session = await auth();
  if (!session || !session.user) return { success: false, error: "Du måste vara inloggad" };

  try {
    // Säkerställ att intervallet alltid är minst 1
    const safeInterval = Math.max(1, data.interval || 1);

    if (data.allInGroup) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { groupId: true }
      });

      if (user?.groupId) {
        const members = await db.user.findMany({
          where: { groupId: user.groupId },
          select: { id: true }
        });

        const sharedGroupId = uuidv4();

        await db.todo.createMany({
          data: members.map(m => ({
            title: data.title,
            date: data.date,
            time: data.time || null,
            endTime: data.endTime || null,
            color: data.color,
            completed: false,
            recurrence: data.recurrence,
            interval: safeInterval,
            daysOfWeek: data.daysOfWeek || null,
            userId: m.id,
            groupIdentifier: sharedGroupId
          }))
        });

        revalidatePath("/");
        return { success: true };
      }
    }

    // Skapa en enskild todo om inte allInGroup är valt eller om grupp saknas
    const todo = await db.todo.create({
      data: {
        title: data.title,
        date: data.date,
        time: data.time || null,
        endTime: data.endTime || null,
        color: data.color,
        completed: false,
        recurrence: data.recurrence,
        interval: safeInterval,
        daysOfWeek: data.daysOfWeek || null,
        userId: data.userId,
      },
    });

    revalidatePath("/");
    return { success: true, todo };
  } catch (error) {
    console.error("Fel vid skapande:", error);
    return { success: false, error: "Kunde inte skapa uppgiften" };
  }
}

export async function updateTodo(id: string, data: UpdateTodoInput) {
  const permission = await checkPermission(id);
  if (!permission.allowed) return { success: false, error: permission.error };

  try {
    const safeInterval = data.interval !== undefined ? Math.max(1, data.interval) : undefined;

    const updateData = {
      title: data.title,
      date: data.date,
      time: data.time === undefined ? undefined : data.time,
      endTime: data.endTime === undefined ? undefined : data.endTime,
      color: data.color,
      recurrence: data.recurrence,
      interval: safeInterval,
      daysOfWeek: data.daysOfWeek,
    };

    if (data.updateAllInGroup && permission.groupIdentifier) {
      await db.todo.updateMany({
        where: { groupIdentifier: permission.groupIdentifier },
        data: updateData,
      });
    } else {
      await db.todo.update({
        where: { id },
        data: updateData,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Fel vid uppdatering:", error);
    return { success: false, error: "Kunde inte uppdatera" };
  }
}

export async function toggleTodo(id: string, completed: boolean, toggleAllInGroup: boolean = false) {
  const permission = await checkPermission(id);
  if (!permission.allowed) return { success: false, error: permission.error };

  try {
    if (toggleAllInGroup && permission.groupIdentifier) {
      await db.todo.updateMany({
        where: { groupIdentifier: permission.groupIdentifier },
        data: { completed }
      });
    } else {
      await db.todo.update({
        where: { id },
        data: { completed }
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Kunde inte uppdatera status" };
  }
}

export async function deleteTodo(id: string, deleteAllInGroup: boolean = false) {
  const permission = await checkPermission(id);
  if (!permission.allowed) return { success: false, error: permission.error };

  try {
    if (deleteAllInGroup && permission.groupIdentifier) {
      await db.todo.deleteMany({
        where: { groupIdentifier: permission.groupIdentifier }
      });
    } else {
      await db.todo.delete({ where: { id } });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Fel vid borttagning:", error);
    return { success: false, error: "Kunde inte radera" };
  }
}