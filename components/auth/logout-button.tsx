"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Vi använder await här för att hålla laddningsstatusen aktiv
      // tills auth-biblioteket påbörjar redirecten
      await signOut({
        callbackUrl: "/login",
        redirect: true
      })
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-2 rounded-xl transition-all active:scale-95",
        "text-slate-500 hover:text-rose-600 hover:bg-rose-50",
        isLoading && "opacity-70 cursor-not-allowed bg-rose-50/50"
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      <span className="hidden sm:inline font-medium">
        {isLoading ? "Loggar ut..." : ""}
      </span>
    </Button>
  )
}