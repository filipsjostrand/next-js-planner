"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * Hjälpfunktion för att kontrollera att den som anropar
 * funktionen faktiskt är en ADMIN.
 */
async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

/**
 * Tar bort en användare permanent från databasen.
 */
export async function deleteUser(userId: string) {
  if (!(await isAdmin())) {
    return { error: "Obehörig åtkomst. Endast admin kan ta bort användare." }
  }

  try {
    await db.user.delete({
      where: { id: userId }
    })
    revalidatePath("/admin")
    return { success: "Användaren har tagits bort." }
  } catch (error) {
    console.error("Delete User Error:", error)
    return { error: "Kunde inte ta bort användaren." }
  }
}

/**
 * Tar bort en grupp/familj.
 */
export async function deleteGroup(groupId: string) {
  if (!(await isAdmin())) {
    return { error: "Obehörig åtkomst." }
  }

  try {
    await db.group.delete({
      where: { id: groupId }
    })
    revalidatePath("/admin")
    return { success: "Gruppen har tagits bort." }
  } catch (error) {
    console.error("Delete Group Error:", error)
    return { error: "Kunde inte ta bort gruppen. Kontrollera om den är tom." }
  }
}

/**
 * Uppdaterar namnet på en specifik användare.
 */
export async function updateUserName(userId: string, newName: string) {
  if (!(await isAdmin())) {
    return { error: "Obehörig åtkomst." }
  }

  if (!newName || newName.trim().length < 2) {
    return { error: "Namnet måste vara minst 2 tecken långt." }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { name: newName.trim() }
    })
    revalidatePath("/admin")
    return { success: "Namnet har uppdaterats." }
  } catch (error) {
    console.error("Update Name Error:", error)
    return { error: "Kunde inte uppdatera namnet." }
  }
}