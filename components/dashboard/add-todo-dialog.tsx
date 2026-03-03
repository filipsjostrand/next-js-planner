"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { createTodo } from "@/app/actions/todo-actions"

export function AddTodoDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = await createTodo({
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      color: "default",
      userId: userId
    })

    setLoading(false)
    if (result.success) {
      setOpen(false) // Stäng rutan vid succé
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" /> Ny Todo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lägg till i planeringen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Vad ska göras?</Label>
            <Input id="title" name="title" placeholder="Ex: Handla mat" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Tid (valfritt)</Label>
              <Input id="time" name="time" type="time" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sparar..." : "Spara Todo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}