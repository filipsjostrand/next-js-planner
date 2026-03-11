"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check, RefreshCw, Calendar as CalendarIcon, Trash2, Clock, Users, CheckCircle2 } from "lucide-react"
import { updateTodo, deleteTodo, toggleTodo } from "@/app/actions/todo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Todo } from "./weekly-view"

type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

const COLORS = [
  { name: "Standard", bg: "bg-card", border: "border-border", value: "default" },
  { name: "Blå", bg: "bg-blue-100", border: "border-blue-300", value: "blue" },
  { name: "Grön", bg: "bg-green-100", border: "border-green-300", value: "green" },
  { name: "Gul", bg: "bg-yellow-100", border: "border-yellow-300", value: "yellow" },
  { name: "Röd", bg: "bg-red-100", border: "border-red-300", value: "red" },
  { name: "Lila", bg: "bg-purple-100", border: "border-purple-300", value: "purple" },
]

interface EditTodoFormProps {
  todo: Todo
  onSuccess: () => void
}

export function EditTodoForm({ todo, onSuccess }: EditTodoFormProps) {
  const [title, setTitle] = useState(todo.title)
  const [date, setDate] = useState(todo.date)
  const [time, setTime] = useState(todo.time || "")
  const [endTime, setEndTime] = useState(todo.endTime || "")
  const [selectedColor, setSelectedColor] = useState(todo.color)
  const [isPending, setIsPending] = useState(false)
  const [applyToGroup, setApplyToGroup] = useState(!!todo.groupIdentifier)

  const [recurrence, setRecurrence] = useState<RecurrenceType>(todo.recurrence as RecurrenceType)
  const [interval, setIntervalValue] = useState(todo.interval || 1)
  const [selectedDays, setSelectedDays] = useState<string[]>(
    todo.daysOfWeek ? todo.daysOfWeek.split(",") : []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    try {
      const result = await updateTodo(todo.id, {
        title,
        date,
        time: time || null,
        endTime: endTime || null,
        color: selectedColor,
        recurrence,
        interval: interval || 1,
        daysOfWeek: selectedDays.length > 0 ? selectedDays.join(",") : null,
        updateAllInGroup: applyToGroup,
      })
      if (result.success) onSuccess()
      else alert(result.error)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleToggleComplete = async () => {
    setIsPending(true)
    try {
      const result = await toggleTodo(todo.id, !todo.completed, applyToGroup)
      if (result.success) onSuccess()
      else alert(result.error)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    const message = applyToGroup
      ? "Detta kommer radera uppgiften för ALLA i gruppen. Fortsätt?"
      : "Vill du radera denna uppgift?"

    if (!confirm(message)) return

    setIsPending(true)
    try {
      const result = await deleteTodo(todo.id, applyToGroup)
      if (result.success) onSuccess()
      else alert(result.error)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2 text-slate-500">
      <div className="space-y-4">
        {/* TITEL & STATUS */}
        <div className="flex gap-2 items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="title" className="text-xs font-bold uppercase">Vad ska göras?</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <Button
            type="button"
            variant={todo.completed ? "default" : "outline"}
            className={cn("h-10 px-3", todo.completed && "bg-green-600 hover:bg-green-700")}
            onClick={handleToggleComplete}
            disabled={isPending}
          >
            <CheckCircle2 className={cn("h-4 w-4 mr-2", todo.completed ? "text-gray-500" : "text-slate-400")} />
            <span className="text-xs font-bold">{todo.completed ? "Klar" : "Klar?"}</span>
          </Button>
        </div>

        {/* GRUPP-VAL (Visas endast om uppgiften redan är delad) */}
        {todo.groupIdentifier && (
          <div className="flex flex-col space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="applyToGroup"
                checked={applyToGroup}
                onCheckedChange={(checked) => setApplyToGroup(!!checked)}
              />
              <Label htmlFor="applyToGroup" className="text-[11px] font-black text-blue-700 flex items-center gap-2 cursor-pointer uppercase tracking-tight">
                <Users className="h-3.5 w-3.5" /> Verka för hela gruppen
              </Label>
            </div>
            <p className="text-[10px] text-blue-600/80 leading-tight pl-5">
              Om markerad kommer ändringar (eller radering) påverka alla medlemmar i gruppen.
            </p>
          </div>
        )}

        {/* DATUM & TID */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-bold uppercase">Datum</Label>
            <div className="relative">
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="pl-9" />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time" className="text-xs font-bold uppercase flex items-center gap-2">
                <Clock className="h-3 w-3" /> Start
              </Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-35 h-9"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-xs font-bold uppercase flex items-center gap-2">
                <Clock className="h-3 w-3" /> Slut
              </Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-35 h-9" />
            </div>
          </div>
        </div>

        {/* FÄRGVAL */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase">Färgkod</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                  color.bg,
                  color.border,
                  selectedColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-70 hover:opacity-100"
                )}
              >
                {selectedColor === color.value && <Check className="h-4 w-4 text-slate-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* ÅTERKOMMANDE */}
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <RefreshCw className="h-3.5 w-3.5" /> Upprepning
          </div>
          <Select value={recurrence} onValueChange={(value: RecurrenceType) => setRecurrence(value)}>
            <SelectTrigger className="bg-background h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Ingen upprepning</SelectItem>
              <SelectItem value="DAILY">Varje dag</SelectItem>
              <SelectItem value="WEEKLY">Varje vecka</SelectItem>
              <SelectItem value="MONTHLY">Varje månad</SelectItem>
              <SelectItem value="YEARLY">Varje år</SelectItem>
            </SelectContent>
          </Select>

          {recurrence !== "NONE" && (
            <div className="flex items-center gap-3 pt-2 animate-in fade-in slide-in-from-top-1">
              <Label className="text-xs font-bold">Intervall:</Label>
              <Input
                type="number"
                min="1"
                className="w-16 h-8 text-xs"
                value={interval}
                onChange={(e) => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {recurrence === "DAILY" ? "dag(ar)" : recurrence === "WEEKLY" ? "vecka/or" : "månad(er)"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KNAPPAR */}
      <div className="flex justify-between gap-2 border-t pt-4">
        <Button
          variant="ghost"
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 text-xs font-bold"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Radera
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={onSuccess} disabled={isPending} className="h-9 text-xs">
            Avbryt
          </Button>
          <Button type="submit" disabled={isPending} className="h-9 text-xs font-bold px-4">
            {isPending ? "Sparar..." : "Spara ändringar"}
          </Button>
        </div>
      </div>
    </form>
  )
}