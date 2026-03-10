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
  targetGroupId?: string;
}

interface UpdateTodoInput extends Partial<CreateTodoInput> {
  updateAllInGroup?: boolean;
}

async function checkPermission(todoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { allowed: false, error: "Ej inloggad" };

  const todo = await db.todo.findUnique({
    where: { id: todoId },
    include: {
      user: {
        include: { groups: { select: { id: true } } }
      }
    }
  });

  if (!todo) return { allowed: false, error: "Uppgiften hittades inte" };

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: { groups: { select: { id: true } } }
  });

  if (!currentUser) return { allowed: false, error: "Användaren hittades inte" };

  const isOwner = todo.userId === currentUser.id;
  const isAdmin = currentUser.role === "ADMIN";

  // Kolla om de delar någon grupp
  const commonGroups = currentUser.groups.filter(group =>
    todo.user.groups.some(g => g.id === group.id)
  );
  const isInSameGroup = commonGroups.length > 0;

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
  if (!session?.user?.id) return { success: false, error: "Du måste vara inloggad" };

  try {
    const safeInterval = Math.max(1, data.interval || 1);

    if (data.targetGroupId) {
      const group = await db.group.findUnique({
        where: { id: data.targetGroupId },
        include: { users: { select: { id: true } } }
      });

      if (group) {
        const sharedGroupId = uuidv4();
        await db.todo.createMany({
          data: group.users.map(m => ({
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
        revalidatePath("/settings");
        return { success: true };
      }
    }

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
        userId: session.user.id,
      },
    });

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true, todo };
  } catch (error) {
    console.error(error);
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
      await db.todo.update({ where: { id }, data: updateData });
    }

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
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
      await db.todo.update({ where: { id }, data: { completed } });
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
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Kunde inte radera" };
  }
}

export async function deleteAllUserTodos() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Du måste vara inloggad för att utföra denna åtgärd." };
  }

  try {
    await db.todo.deleteMany({
      where: {
        userId: session.user.id
      }
    });

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Delete all todos error:", error);
    return { success: false, error: "Ett tekniskt fel uppstod när uppgifterna skulle raderas." };
  }
}

/**
 * Importerar flera uppgifter samtidigt.
 * Stöder formatet: [Status] Datum (Tid): Titel
 */
export async function importTodos(todos: {
  title: string;
  date: string;
  time?: string | null;
  completed: boolean
}[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Ej inloggad" };

  try {
    const dataToCreate = todos.map(todo => ({
      title: todo.title,
      date: todo.date,
      time: todo.time || null,
      completed: todo.completed,
      userId: session.user.id,
      recurrence: "NONE" as const,
      interval: 1,
      color: "#3b82f6", // Default blå färg vid import
    }));

    await db.todo.createMany({
      data: dataToCreate
    });

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true, count: dataToCreate.length };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, error: "Kunde inte importera uppgifter." };
  }
}