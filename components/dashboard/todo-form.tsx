"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check, RefreshCw, Calendar as CalendarIcon, Clock } from "lucide-react"
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

const DAYS = [
  { id: "1", label: "M" }, { id: "2", label: "T" }, { id: "3", label: "O" },
  { id: "4", label: "T" }, { id: "5", label: "F" }, { id: "6", label: "L" }, { id: "7", label: "S" },
]

interface TodoFormProps {
  date: string
  userId: string
  onSuccess: () => void
}

export function TodoForm({ date: initialDate, userId, onSuccess }: TodoFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("") // Ny state för sluttid
  const [selectedColor, setSelectedColor] = useState("default")
  const [isPending, setIsPending] = useState(false)

  const [recurrence, setRecurrence] = useState<RecurrenceType>("NONE")
  const [interval, setIntervalValue] = useState(1)
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    try {
      const result = await createTodo({
        title,
        date,
        time: startTime,
        endTime: endTime || null, // Skicka med sluttid om den finns
        color: selectedColor,
        recurrence,
        interval,
        daysOfWeek: selectedDays.length > 0 ? selectedDays.join(",") : null,
        userId,
      })

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error || "Något gick fel")
      }
    } catch (error) {
      console.error("Fel vid sparande:", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-4">
        {/* Titel */}
        <div className="space-y-2">
          <Label htmlFor="title">Vad ska planeras?</Label>
          <Input
            id="title"
            placeholder="Ex: Träna, Handla..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        {/* Datum */}
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              required
              className="pl-9"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Tidpunkter (Start och Slut) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="h-3 w-3" /> Starttid
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="flex items-center gap-2 text-muted-foreground">
              Sluttid <span className="text-[10px] font-normal">(valfritt)</span>
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border-dashed"
            />
          </div>
        </div>

        {/* Färgval */}
        <div className="space-y-2">
          <Label>Färg</Label>
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
                  selectedColor === color.value ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-70"
                )}
              >
                {selectedColor === color.value && <Check className="h-4 w-4 text-slate-900" />}
              </button>
            ))}
          </div>
        </div>

        {/* ÅTERKOMMANDE SEKTION */}
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            ÅTERKOMMANDE
          </div>

          <Select
            value={recurrence}
            onValueChange={(value: RecurrenceType) => setRecurrence(value)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Välj typ" />
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
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <Label className="text-xs whitespace-nowrap">Var</Label>
                <Input
                  type="number"
                  min="1"
                  className="w-16 h-8"
                  value={interval}
                  onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)}
                />
                <Label className="text-xs whitespace-nowrap">
                  {recurrence === "DAILY" && "dag"}
                  {recurrence === "WEEKLY" && "vecka"}
                  {recurrence === "MONTHLY" && "månad"}
                  {recurrence === "YEARLY" && "år"}
                </Label>
              </div>

              {recurrence === "WEEKLY" && (
                <div className="flex justify-between gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={cn(
                        "h-8 flex-1 rounded-md text-[10px] font-bold border transition-all",
                        selectedDays.includes(day.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" type="button" onClick={onSuccess} disabled={isPending}>
          Avbryt
        </Button>
        <Button type="submit" disabled={isPending} className="bg-primary">
          {isPending ? "Sparar..." : "Spara i kalendern"}
        </Button>
      </div>
    </form>
  )
}