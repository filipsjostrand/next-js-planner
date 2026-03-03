"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logga ut</span>
    </Button>
  )
}