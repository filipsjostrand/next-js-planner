"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TodoForm } from "@/components/dashboard/todo-form"
import { useRouter } from "next/navigation"

interface AddTodoButtonProps {
  userId: string
  // Vi tar emot listan på grupper som användaren tillhör
  groups?: { id: string, name: string }[]
}

export function AddTodoButton({ userId, groups = [] }: AddTodoButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Sätter standarddatumet till idag för nya uppgifter
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Ny Uppgift
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-2xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-500">
            Skapa ny uppgift
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Fyll i detaljerna nedan. Du kan välja att dela uppgiften med en av dina grupper.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <TodoForm
            date={today}
            userId={userId}
            // Här skickar vi vidare grupperna så att TodoForm kan rendera en Select-box
            groups={groups}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}