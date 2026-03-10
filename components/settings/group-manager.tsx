"use client"

import { useState, useTransition } from "react"
import { Users, Plus, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinGroup, leaveGroup } from "@/app/actions/group"
import { useRouter } from "next/navigation"

interface Group {
  id: string
  name: string
}

interface GroupManagerProps {
  initialGroups: Group[]
}

export function GroupManager({ initialGroups }: GroupManagerProps) {
  const [newGroupName, setNewGroupName] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Vi använder inte lokalt state för 'groups' längre,
  // utan förlitar oss på att Servern skickar ner nya initialGroups via router.refresh()
  const onJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName) return

    startTransition(async () => {
      try {
        const res = await joinGroup(newGroupName)

        if (res.success) {
          setNewGroupName("")
          router.refresh() // Uppdaterar Server Components på sidan utan reload
        } else {
          alert(res.error)
        }
      } catch (err) {
        alert("Ett oväntat fel uppstod.")
      }
    })
  }

  const onLeave = async (id: string) => {
    if (!confirm("Är du säker på att du vill lämna denna grupp?")) return

    startTransition(async () => {
      try {
        const res = await leaveGroup(id)

        if (res.success) {
          router.refresh() // Uppdaterar listan direkt
        } else {
          alert(res.error)
        }
      } catch (err) {
        alert("Kunde inte lämna gruppen.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-lg text-black font-bold flex items-center gap-2 uppercase tracking-tight">
          <Users className="h-5 w-5 text-primary" /> Mina Grupper
        </h2>
        <p className="text-xs text-muted-foreground">Du kan vara medlem i flera grupper samtidigt</p>
      </div>

      {/* Lista på nuvarande grupper */}
      <div className="space-y-3">
        {initialGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Du tillhör ingen grupp ännu.</p>
        ) : (
          initialGroups.map((group) => (
            <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
              <span className="font-semibold text-slate-900">{group.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:bg-red-50"
                onClick={() => onLeave(group.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Lämna
                  </>
                )}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Form för att gå med i ny grupp */}
      <form onSubmit={onJoin} className="flex gap-2 pt-4">
        <Input
          placeholder="Nytt gruppnamn..."
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          disabled={isPending}
        />
        <Button
          type="submit"
          disabled={isPending || !newGroupName.trim()}
          className="min-w-[100px]"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Gå med
            </>
          )}
        </Button>
      </form>
    </div>
  )
}