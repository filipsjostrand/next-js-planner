"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { signOut } from "@/auth";

export async function deleteUserAccount() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Obehörig" };
  }

  try {
    await db.user.delete({
      where: { id: session.user.id }
    });

    // Logga ut användaren efter att kontot raderats
    await signOut({ redirectTo: "/login" });

    return { success: "Kontot har raderats" };
  } catch (error) {
    console.error(error);
    return { error: "Kunde inte radera kontot. Kontakta support." };
  }
}