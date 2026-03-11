"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check, RefreshCw, Calendar as CalendarIcon, Clock, Users } from "lucide-react"
import { createTodo } from "@/app/actions/todo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

const COLORS = [
  { name: "Standard", bg: "bg-card", border: "border-border", value: "default" },
  { name: "Blå", bg: "bg-blue-100", border: "border-blue-300", value: "blue" },
  { name: "Grön", bg: "bg-green-100", border: "border-green-300", value: "green" },
  { name: "Gul", bg: "bg-yellow-100", border: "border-yellow-300", value: "yellow" },
  { name: "Röd", bg: "bg-red-100", border: "border-red-300", value: "red" },
  { name: "Lila", bg: "bg-purple-100", border: "border-purple-300", value: "purple" },
]

interface TodoFormProps {
  date: string
  userId: string
  groups: { id: string, name: string }[]
  onSuccess: () => void
}

export function TodoForm({ date: initialDate, userId, groups, onSuccess }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("")
  const [selectedColor, setSelectedColor] = useState("default")
  const [targetGroupId, setTargetGroupId] = useState<string>("none")
  const [isPending, setIsPending] = useState(false)
  const [recurrence, setRecurrence] = useState<RecurrenceType>("NONE")
  const [interval, setIntervalValue] = useState(1) // Ny state för intervall

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    try {
      const result = await createTodo({
        title,
        date,
        time: startTime,
        endTime: endTime || null,
        color: selectedColor,
        recurrence,
        interval: interval || 1, // Skickar med det valda intervallet
        daysOfWeek: null,
        userId,
        targetGroupId: targetGroupId === "none" ? undefined : targetGroupId,
      })

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error || "Något gick fel")
      }
    } catch (error) {
      alert("Ett tekniskt fel uppstod.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2 text-slate-900">
      <div className="space-y-4">
        {/* TITEL */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-bold uppercase text-slate-500">Titel</Label>
          <Input
            id="title"
            placeholder="Ex: Träna, Handla, Möte..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
            className="focus-visible:ring-primary text-slate-500"
          />
        </div>

        {/* GRUPPVAL */}
        <div className="space-y-2 p-3 bg-gray-600 rounded-lg border border-slate-400">
          <Label className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-tight text-slate-400 mb-1">
            <Users className="h-3 w-3 text-primary" /> Delning & Synlighet
          </Label>
          <Select value={targetGroupId} onValueChange={setTargetGroupId}>
            <SelectTrigger className="bg-white h-9 text-xs border-slate-400">
              <SelectValue placeholder="Välj vem som ser detta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">🔒 Privat (Bara min kalender)</SelectItem>
              {groups.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase">Dina Grupper</div>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      👥 Grupp: {group.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-slate-400 italic px-1">
            {targetGroupId === "none"
              ? "Uppgiften skapas bara för dig."
              : "Uppgiften kopieras ut till alla medlemmar i gruppen."}
          </p>
        </div>

        {/* DATUM */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-bold uppercase text-slate-500">Datum</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="pl-9 focus-visible:ring-primary text-slate-500"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* TID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 text-slate-500">
            <Label htmlFor="startTime" className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" /> Start
            </Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-35 h-9" />
          </div>
          <div className="space-y-2 text-slate-500">
            <Label htmlFor="endTime" className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" /> Slut
            </Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-35 h-9" />
          </div>
        </div>

        {/* FÄRGVAL */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Färgmarkering</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center shadow-sm",
                  color.bg,
                  color.border,
                  selectedColor === color.value
                    ? "ring-2 ring-primary ring-offset-2 scale-110 border-slate-600"
                    : "opacity-80 hover:opacity-100 hover:scale-105"
                )}
                title={color.name}
              >
                {selectedColor === color.value && <Check className="h-4 w-4 text-slate-900" />}
              </button>
            ))}
          </div>
        </div>

        {/* RECURRENCE & INTERVAL */}
        <div className="p-3 bg-gray-600 rounded-lg border border-slate-400 space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            <RefreshCw className="h-3 w-3 text-primary" /> Återkommande
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={recurrence} onValueChange={(value: RecurrenceType) => setRecurrence(value)}>
                <SelectTrigger className="bg-gray-500 h-9 text-xs border-slate-400">
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
            </div>

            {recurrence !== "NONE" && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Var :</Label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  className="h-9 w-16 text-xs bg-gray-500"
                  value={interval}
                  onChange={(e) => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {recurrence === "WEEKLY" ? "vecka" : recurrence === "DAILY" ? "dag" : "månad"}
                </span>
              </div>
            )}
          </div>

          {recurrence !== "NONE" && interval > 1 && (
            <p className="text-[10px] text-primary font-medium italic px-1">
              Uppgiften kommer skapas var {interval}:e {recurrence === "WEEKLY" ? "vecka" : recurrence === "DAILY" ? "dag" : "månad"}.
            </p>
          )}
        </div>
      </div>

      {/* KNAPPAR */}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <Button
          variant="ghost"
          type="button"
          onClick={onSuccess}
          disabled={isPending}
          className="h-10 text-xs text-slate-500 hover:bg-slate-100"
        >
          Avbryt
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 text-xs font-bold px-8 shadow-md"
        >
          {isPending ? "Sparar..." : "Spara uppgift"}
        </Button>
      </div>
    </form>
  )
}