"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function joinGroup(groupName: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Ej inloggad" }

  const trimmedName = groupName.trim()
  if (!trimmedName) return { error: "Gruppnamn kan inte vara tomt" }

  try {
    // Använder upsert för att antingen skapa gruppen eller bara koppla användaren
    await db.group.upsert({
      where: { name: trimmedName },
      update: {
        users: { connect: { id: session.user.id } }
      },
      create: {
        name: trimmedName,
        users: { connect: { id: session.user.id } }
      }
    })

    // Uppdatera både inställningar och startsidan (där UserSelector och kalender finns)
    revalidatePath("/settings")
    revalidatePath("/")

    return { success: `Du har gått med i gruppen "${trimmedName}"` }
  } catch (error) {
    console.error("Join Group Error:", error)
    return { error: "Kunde inte gå med i gruppen" }
  }
}

export async function leaveGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Ej inloggad" }

  try {
    // 1. Koppla bort användaren från gruppen
    await db.user.update({
      where: { id: session.user.id },
      data: {
        groups: {
          disconnect: { id: groupId }
        }
      }
    })

    // 2. Valfritt: Kolla om gruppen nu är helt tom och ta bort den i så fall
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: { _count: { select: { users: true } } }
    })

    if (group && group._count.users === 0) {
      await db.group.delete({
        where: { id: groupId }
      })
    }

    revalidatePath("/settings")
    revalidatePath("/")

    return { success: "Du har lämnat gruppen" }
  } catch (error) {
    console.error("Leave Group Error:", error)
    return { error: "Kunde inte lämna gruppen" }
  }
}