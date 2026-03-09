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
}

export function AddTodoButton({ userId }: AddTodoButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Standarddatum är idag när man klickar på huvudknappen
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" /> Ny Uppgift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Skapa ny uppgift</DialogTitle>
          <DialogDescription className="sr-only">
            Fyll i detaljerna nedan för att lägga till en ny uppgift i din planering.
          </DialogDescription>
        </DialogHeader>
        <TodoForm
          date={today}
          userId={userId}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}