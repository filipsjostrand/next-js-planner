"use client"

import { deleteUser, deleteGroup } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"

export function DeleteButton({ id, type }: { id: string, type: "user" | "group" }) {
  const [isPending, setIsPending] = useState(false)

  const onClick = async () => {
    const ok = confirm(`Är du säker på att du vill ta bort denna ${type === "user" ? "användare" : "grupp"}?`)
    if (!ok) return

    setIsPending(true)
    const result = type === "user" ? await deleteUser(id) : await deleteGroup(id)

    if (result.error) alert(result.error)
    setIsPending(false)
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Radera
    </Button>
  )
}