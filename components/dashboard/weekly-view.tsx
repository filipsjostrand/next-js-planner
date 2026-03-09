"use client"

import { useState, useEffect } from "react"
import {
  addDays,
  format,
  startOfWeek,
  getWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInDays,
  getDay,
  isToday as isTodayCheck,
  startOfDay,
  subDays
} from "date-fns"
import { sv } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Check,
  Trash2,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TodoForm } from "./todo-form"
import { EditTodoForm } from "./edit-todo-form"
import { ModeToggle } from "@/components/mode-toggle"
import { toggleTodo, deleteTodo } from "@/app/actions/todo"
import * as XLSX from "xlsx"

export interface Todo {
  id: string
  title: string
  date: string
  time: string | null
  endTime: string | null
  color: string
  completed: boolean
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
  interval: number
  daysOfWeek: string | null
  userId: string
  groupIdentifier?: string | null
}

interface WeeklyViewProps {
  initialTodos: Todo[]
  isReadOnly?: boolean
  currentUserId?: string
}

const getColorClass = (color: string) => {
  switch (color) {
    case "blue": return "bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-300"
    case "green": return "bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-300"
    case "yellow": return "bg-yellow-500/20 border-yellow-500/30 text-yellow-600 dark:text-yellow-300"
    case "red": return "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-300"
    case "purple": return "bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-300"
    default: return "bg-muted border-border text-foreground"
  }
}

export function WeeklyView({ initialTodos = [], isReadOnly = false, currentUserId }: WeeklyViewProps) {
  const [view, setView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [todos, setTodos] = useState<Todo[]>(initialTodos)

  useEffect(() => {
    setTodos(initialTodos)
  }, [initialTodos])

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekNumber = getWeek(weekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const next = () => view === "week" ? setCurrentDate(addDays(currentDate, 7)) : setCurrentDate(addMonths(currentDate, 1))
  const prev = () => view === "week" ? setCurrentDate(subDays(currentDate, 7)) : setCurrentDate(subMonths(currentDate, 1))

  const handleAddTodo = (date: Date) => {
    if (isReadOnly) return
    setSelectedDate(format(date, "yyyy-MM-dd"))
    setIsOpen(true)
  }

  const handleToggle = async (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation()
    if (isReadOnly) return

    const newStatus = !todo.completed
    const originalTodos = [...todos]

    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: newStatus } : t))

    const result = await toggleTodo(todo.id, newStatus)
    if (!result.success) {
      setTodos(originalTodos)
      alert(result.error || "Kunde inte uppdatera status.")
    }
  }

  const handleDelete = async (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation()
    if (isReadOnly) return

    let deleteAllInGroup = false
    if (todo.groupIdentifier) {
      const choice = confirm("Denna uppgift tillhör en grupp. Vill du radera den för ALLA medlemmar?\n\n(OK = Alla, Avbryt = Endast dig)")
      if (choice) deleteAllInGroup = true
      else if (!confirm("Vill du radera uppgiften för dig själv?")) return
    } else {
      if (!confirm("Vill du radera uppgiften?")) return
    }

    const originalTodos = [...todos]
    if (deleteAllInGroup) {
      setTodos(prev => prev.filter(t => t.groupIdentifier !== todo.groupIdentifier))
    } else {
      setTodos(prev => prev.filter(t => t.id !== todo.id))
    }

    const result = await deleteTodo(todo.id, deleteAllInGroup)
    if (!result.success) {
      setTodos(originalTodos)
      alert(result.error || "Kunde inte radera uppgiften.")
    }
  }

  const handleExport = (formatType: 'txt' | 'excel') => {
    const dataToExport = todos.map(t => ({
      Titel: t.title,
      Datum: t.date,
      Starttid: t.time || "Ingen tid",
      Sluttid: t.endTime || "-",
      Status: t.completed ? "Klar" : "Ej klar",
      Upprepning: t.recurrence
    }));

    if (formatType === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Planering");
      XLSX.writeFile(workbook, `Planering_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    } else {
      const txtContent = dataToExport
        .map(t => `[${t.Status}] ${t.Datum} (${t.Starttid}${t.Sluttid !== "-" ? " - " + t.Sluttid : ""}): ${t.Titel}`)
        .join("\n");

      const blob = new Blob([txtContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Planering_${format(new Date(), "yyyy-MM-dd")}.txt`;
      link.click();
    }
  }

  const shouldShowTodo = (todo: Todo, targetDate: Date) => {
    const normalizedTarget = startOfDay(targetDate)
    const todoStartDate = startOfDay(parseISO(todo.date))
    const interval = todo.interval || 1

    if (normalizedTarget < todoStartDate) return false
    if (todo.recurrence === "NONE") return format(normalizedTarget, "yyyy-MM-dd") === todo.date

    if (todo.recurrence === "DAILY") {
      const diff = differenceInDays(normalizedTarget, todoStartDate)
      return diff % interval === 0
    }

    if (todo.recurrence === "WEEKLY") {
      const weeksDiff = differenceInWeeks(normalizedTarget, todoStartDate)
      if (weeksDiff % interval !== 0) return false

      if (todo.daysOfWeek) {
        const dayOfWeek = getDay(normalizedTarget)
        const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek
        return todo.daysOfWeek.split(',').includes(adjustedDay.toString())
      }
      return getDay(normalizedTarget) === getDay(todoStartDate)
    }

    if (todo.recurrence === "MONTHLY") {
      const monthsDiff = differenceInMonths(normalizedTarget, todoStartDate)
      return monthsDiff % interval === 0 && normalizedTarget.getDate() === todoStartDate.getDate()
    }

    if (todo.recurrence === "YEARLY") {
      const yearsDiff = differenceInYears(normalizedTarget, todoStartDate)
      return yearsDiff % interval === 0 &&
             normalizedTarget.getDate() === todoStartDate.getDate() &&
             normalizedTarget.getMonth() === todoStartDate.getMonth()
    }
    return false
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b bg-muted/20 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="font-bold capitalize text-xl leading-none mb-1">
              {format(currentDate, "MMMM yyyy", { locale: sv })}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <CalendarIcon className="h-3 w-3" />
                {view === "week" ? `Vecka ${weekNumber}` : "Månadsöversikt"}
              </span>
              {isReadOnly && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] flex items-center gap-1 font-black animate-pulse">
                  <Eye className="h-2.5 w-2.5"/> VISNINGSLÄGE
                </span>
              )}
            </div>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")} className="ml-4">
            <TabsList className="grid w-[160px] grid-cols-2 h-8">
              <TabsTrigger value="week" className="text-xs font-bold">Vecka</TabsTrigger>
              <TabsTrigger value="month" className="text-xs font-bold">Månad</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2 items-center">
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 text-xs font-bold">
            IDAG
          </Button>
          <div className="flex items-center border rounded-md bg-background shadow-sm overflow-hidden">
            <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none border-r hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none hover:bg-muted"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className={cn(
        "grid flex-1 overflow-auto bg-border gap-[1px]",
        view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-7"
      )}>
        {(view === "week" ? weekDays : monthDays).map((day) => {
          const isToday = isTodayCheck(day)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const dateStr = format(day, "yyyy-MM-dd")

          const dayTodos = todos
            .filter(todo => shouldShowTodo(todo, day))
            .sort((a, b) => {
              if (!a.time && !b.time) return 0;
              if (!a.time) return 1;
              if (!b.time) return -1;
              return a.time.localeCompare(b.time);
            });

          return (
            <div key={day.toString()} className={cn(
              "flex flex-col min-h-[160px] p-2 transition-colors",
              isToday ? "bg-background z-10" : "bg-slate-125/80",
              !isCurrentMonth && view === "month" && "opacity-40 grayscale-[0.5]"
            )}>
              <div className="mb-2">
                {view === "week" ? (
                  <div className={cn(
                    "flex flex-col p-2 rounded-md w-full items-center border transition-all",
                    isToday ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background/50 border-border"
                  )}>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest leading-none mb-1", isToday ? "opacity-90" : "opacity-60")}>
                      {format(day, "eeee", { locale: sv })}
                    </span>
                    <span className="text-sm font-mono font-bold tracking-tighter">{dateStr}</span>
                  </div>
                ) : (
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all mx-auto md:mx-0",
                    isToday ? "bg-primary text-primary-foreground shadow-md scale-110" : "hover:bg-muted"
                  )}>
                    {format(day, "d")}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
                {dayTodos.map(todo => (
                  <div
                    key={`${todo.id}-${dateStr}`}
                    onClick={() => !isReadOnly && setEditingTodo(todo)}
                    className={cn(
                      "group/todo p-1.5 rounded border text-[11px] font-bold shadow-sm transition-all flex items-start gap-2 relative cursor-pointer hover:ring-1 ring-primary/30",
                      getColorClass(todo.color),
                      todo.completed && "opacity-50 grayscale-[0.3]"
                    )}
                  >
                    {!isReadOnly ? (
                      <button
                        onClick={(e) => handleToggle(e, todo)}
                        className={cn(
                          "mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors",
                          todo.completed ? "bg-green-600 border-green-600 text-white" : "bg-white/80 border-black/10 dark:bg-black/20"
                        )}
                      >
                        {todo.completed && <Check className="h-3 w-3 stroke-[3px]" />}
                      </button>
                    ) : (
                      todo.completed && <Check className="h-3 w-3 mt-1 text-green-600 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 opacity-70 italic mb-0.5 text-[9px]">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{todo.time || "Ingen tid"}</span>
                        {todo.endTime && (
                          <>
                            <span>-</span>
                            <span>{todo.endTime}</span>
                          </>
                        )}
                        {todo.recurrence !== "NONE" && <RefreshCw className="h-2.5 w-2.5 ml-1 text-primary animate-spin-slow" />}
                      </div>
                      <div className={cn("truncate leading-tight", todo.completed && "line-through")}>
                        {todo.title}
                      </div>
                    </div>

                    {!isReadOnly && (
                      <button
                        onClick={(e) => handleDelete(e, todo)}
                        className="opacity-50 group-hover/todo:opacity-100 transition-opacity p-1 hover:text-red-500 rounded bg-background/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => handleAddTodo(day)}
                  className="mt-2 w-full text-left text-[10px] font-black text-muted-foreground flex items-center gap-1 p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors group"
                >
                  <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                  NY UPPGIFT
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t bg-muted/10 flex items-center justify-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Exportera:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('excel')}
          className="h-9 px-4 text-xs font-bold gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Excel (.xlsx)
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('txt')}
          className="h-9 px-4 text-xs font-bold gap-2 hover:bg-slate-50 transition-colors"
        >
          <FileText className="h-4 w-4 text-slate-600" />
          Textfil (.txt)
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ny uppgift</DialogTitle>
            <DialogDescription>
              Fyll i detaljerna för att skapa en ny planering den {selectedDate}.
            </DialogDescription>
          </DialogHeader>
          {selectedDate && currentUserId && (
            <TodoForm
              date={selectedDate}
              userId={currentUserId}
              onSuccess={() => setIsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Redigera planering</DialogTitle>
            <DialogDescription>
              Här kan du ändra tid, färg eller radera uppgiften för dig eller gruppen.
            </DialogDescription>
          </DialogHeader>
          {editingTodo && (
            <EditTodoForm
              todo={editingTodo}
              onSuccess={() => setEditingTodo(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}