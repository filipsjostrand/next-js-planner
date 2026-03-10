"use client"

import { useState } from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteUserAccount } from "@/app/actions/user"

export function DeleteAccountSection() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDelete = async () => {
    setError(null)

    const confirmed = confirm(
      "ÄR DU HELT SÄKER? \n\nDetta kommer radera ditt konto och ALLA dina personliga uppgifter permanent. Denna åtgärd går inte att ångra."
    )

    if (!confirmed) return

    setIsPending(true)
    try {
      const res = await deleteUserAccount()

      if (res?.error) {
        setError(res.error)
        setIsPending(false)
      }
      // Vid success sköter deleteUserAccount redirect via signOut,
      // så vi behöver inte göra något mer här.
    } catch (err) {
      setError("Ett oväntat fel uppstod. Försök igen senare.")
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-tight text-sm">
            <AlertTriangle className="h-4 w-4" />
            Radera konto permanent
          </div>
          <p className="text-sm text-slate-600">
            När du raderar ditt konto försvinner all din data från våra servrar.
          </p>
        </div>

        <Button
          variant="destructive"
          className="font-bold whitespace-nowrap"
          onClick={onDelete}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Radera mitt konto
        </Button>
      </div>

      {/* Lokalt felmeddelande om något går snett */}
      {error && (
        <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  )
}