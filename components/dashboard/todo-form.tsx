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
import { Checkbox } from "@/components/ui/checkbox"

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
  { id: "1", label: "Mån" },
  { id: "2", label: "Tis" },
  { id: "3", label: "Ons" },
  { id: "4", label: "Tor" },
  { id: "5", label: "Fre" },
  { id: "6", label: "Lör" },
  { id: "7", label: "Sön" },
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
  const [endTime, setEndTime] = useState("")
  const [selectedColor, setSelectedColor] = useState("default")
  const [allInGroup, setAllInGroup] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Återkommande inställningar
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
        endTime: endTime || null,
        color: selectedColor,
        recurrence,
        interval: interval || 1,
        daysOfWeek: selectedDays.length > 0 ? selectedDays.join(",") : null,
        userId,
        allInGroup,
      })

      if (result.success) {
        onSuccess()
      } else {
        alert(result.error || "Något gick fel")
      }
    } catch (error) {
      console.error("Fel vid sparande:", error)
      alert("Ett tekniskt fel uppstod.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Vad ska planeras?</Label>
          <Input
            id="title"
            placeholder="Ex: Träna..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        {/* GRUPP-VAL */}
        <div className="flex items-center space-x-2 p-3 bg-primary/5 rounded-lg border border-primary/10 transition-colors hover:bg-primary/10">
          <Checkbox
            id="allInGroup"
            checked={allInGroup}
            onCheckedChange={(checked) => setAllInGroup(!!checked)}
          />
          <Label htmlFor="allInGroup" className="text-xs font-bold flex items-center gap-2 cursor-pointer select-none uppercase tracking-tight text-primary">
            <Users className="h-3.5 w-3.5" /> Lägg till för alla i gruppen
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="pl-9"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Starttid
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
            <Label htmlFor="endTime" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Sluttid
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

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
                  selectedColor === color.value
                    ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-sm"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {selectedColor === color.value && <Check className="h-4 w-4 text-slate-900" />}
              </button>
            ))}
          </div>
        </div>

        {/* ÅTERKOMMANDE-SEKTION */}
        <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-tight">
            <RefreshCw className={cn("h-4 w-4", recurrence !== "NONE" && "animate-spin-slow")} /> Återkommande
          </div>

          <div className="space-y-3">
            <Select value={recurrence} onValueChange={(value: RecurrenceType) => setRecurrence(value)}>
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
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3">
                  <Label className="text-xs font-semibold">Upprepa var:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      className="w-16 h-8 text-center font-bold"
                      value={interval}
                      onChange={(e) => setIntervalValue(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {recurrence === "DAILY" ? (interval === 1 ? "dag" : "dagar") :
                       recurrence === "WEEKLY" ? (interval === 1 ? "vecka" : "veckor") :
                       recurrence === "MONTHLY" ? (interval === 1 ? "månad" : "månader") :
                       (interval === 1 ? "år" : "år")}
                    </span>
                  </div>
                </div>

                {recurrence === "WEEKLY" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">På dagar:</Label>
                    <div className="flex justify-between gap-1">
                      {DAYS.map((day) => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={cn(
                            "h-8 flex-1 rounded-md text-[10px] font-bold border transition-all shadow-sm",
                            selectedDays.includes(day.id)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted text-muted-foreground"
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" type="button" onClick={onSuccess} disabled={isPending}>
          Avbryt
        </Button>
        <Button type="submit" disabled={isPending} className="font-bold min-w-[120px]">
          {isPending ? "Sparar..." : "Spara planering"}
        </Button>
      </div>
    </form>
  )
}