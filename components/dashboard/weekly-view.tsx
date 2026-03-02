"use client"

import { useState } from "react"
import {
  addDays,
  format,
  startOfWeek,
  subDays,
  getWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from "date-fns"
import { sv } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export function WeeklyView() {
  const [view, setView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // --- LOGIK FÖR VECKOVY ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekNumber = getWeek(weekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 })

  // --- LOGIK FÖR MÅNADSVY ---
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const next = () => {
    view === "week" ? setCurrentDate(addDays(currentDate, 7)) : setCurrentDate(addMonths(currentDate, 1))
  }
  const prev = () => {
    view === "week" ? setCurrentDate(subDays(currentDate, 7)) : setCurrentDate(subMonths(currentDate, 1))
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* ÖVRE NAVIGATION */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b bg-muted/20 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="font-bold capitalize text-xl leading-none mb-1">
              {format(currentDate, "MMMM yyyy", { locale: sv })}
            </h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
              <CalendarIcon className="h-3 w-3" />
              {view === "week" ? `Vecka ${weekNumber}` : "Månadsöversikt"}
            </span>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")} className="ml-4">
            <TabsList className="grid w-[160px] grid-cols-2 h-8">
              <TabsTrigger value="week" className="text-xs">Vecka</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">Månad</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 text-xs font-bold">
            IDAG
          </Button>
          <div className="flex items-center border rounded-md bg-background shadow-sm overflow-hidden">
            <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none border-r">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KALENDER-GRID */}
      <div className={cn(
        "grid flex-1 overflow-auto bg-border gap-[1px]",
        view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-7"
      )}>
        {/* Veckodagsnamn (syns bara i månads-vy) */}
        {view === "month" && ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map(d => (
          <div key={d} className="bg-muted/50 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
            {d}
          </div>
        ))}

        {(view === "week" ? weekDays : monthDays).map((day) => {
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, monthStart)

          return (
            <div key={day.toString()} className={cn(
              "flex flex-col min-h-[140px] p-2 transition-colors bg-background",
              !isCurrentMonth && view === "month" && "bg-muted/30 text-muted-foreground/40"
            )}>

              <div className="flex justify-between items-start mb-2">
                {view === "week" ? (
                  <div className={cn(
                    "flex flex-col p-2 rounded-md w-full items-center border transition-all",
                    isToday
                      ? "bg-primary text-primary-foreground shadow-md border-primary"
                      : "bg-muted/10 border-border"
                  )}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
                      {format(day, "eeee", { locale: sv })}
                    </span>
                    <span className="text-sm font-mono font-bold tracking-tighter">
                      {format(day, "yyyy-MM-dd")}
                    </span>
                  </div>
                ) : (
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
                    isToday
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}>
                    {format(day, "d")}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden px-1">
                {/* Framtida rendering av todos/uppgifter */}
              </div>

              {/* Knappen visas nu hela tiden */}
              <button className="mt-2 w-full text-left text-[10px] font-bold text-muted-foreground flex items-center gap-1 p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors group">
                <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                NY UPPGIFT
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}