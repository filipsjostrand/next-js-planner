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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Check, Trash2 } from "lucide-react"
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
import { ModeToggle } from "@/components/mode-toggle"
import { toggleTodo, deleteTodo } from "@/app/actions/todo"

interface Todo {
  id: string
  title: string
  date: string
  time: string | null
  color: string
  completed: boolean
}

interface WeeklyViewProps {
  initialTodos: Todo[]
}

const getColorClass = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-300"
    case "green":
      return "bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-300"
    case "yellow":
      return "bg-yellow-500/20 border-yellow-500/30 text-yellow-600 dark:text-yellow-300"
    case "red":
      return "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-300"
    case "purple":
      return "bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-300"
    default:
      return "bg-muted border-border text-foreground"
  }
}

export function WeeklyView({ initialTodos }: WeeklyViewProps) {
  const [view, setView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
    setSelectedDate(format(date, "yyyy-MM-dd"))
    setIsOpen(true)
  }

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground">
      {/* NAVIGATION */}
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
            <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none border-r"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className={cn(
        "grid flex-1 overflow-auto bg-border gap-[1px]",
        view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-7"
      )}>
        {(view === "week" ? weekDays : monthDays).map((day) => {
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, monthStart)
          const dateStr = format(day, "yyyy-MM-dd")
          const dayTodos = initialTodos.filter(todo => todo.date === dateStr)

          return (
            <div key={day.toString()} className={cn(
              "flex flex-col min-h-[160px] p-2 transition-colors bg-background",
              !isCurrentMonth && view === "month" && "bg-muted/30 text-muted-foreground/40"
            )}>
              <div className="mb-2">
                {view === "week" ? (
                  <div className={cn(
                    "flex flex-col p-2 rounded-md w-full items-center border transition-all",
                    isToday ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-muted/10 border-border"
                  )}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
                      {format(day, "eeee", { locale: sv })}
                    </span>
                    <span className="text-sm font-mono font-bold tracking-tighter">{dateStr}</span>
                  </div>
                ) : (
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
                    isToday ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
                  )}>
                    {format(day, "d")}
                  </div>
                )}
              </div>

              {/* TODO LISTA */}
              <div className="flex-1 space-y-1 overflow-y-auto">
                {dayTodos.map(todo => (
                  <div
                    key={todo.id}
                    className={cn(
                      "group/todo p-1.5 rounded border text-[11px] font-medium shadow-sm transition-all flex items-start gap-2 relative",
                      getColorClass(todo.color),
                      todo.completed && "opacity-50"
                    )}
                  >
                    {/* Checkbox (1x1 cm) */}
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={cn(
                        "mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors",
                        todo.completed ? "bg-green-600 border-green-600 text-white" : "bg-white/80 border-black/10 dark:bg-black/20"
                      )}
                    >
                      {todo.completed && <Check className="h-3 w-3 stroke-[3px]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 opacity-70 italic font-bold mb-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {todo.time}
                      </div>
                      <div className={cn("truncate", todo.completed && "line-through")}>
                        {todo.title}
                      </div>
                    </div>

                    {/* Papperskorg (visas vid hover) */}
                    <button
                      onClick={() => { if(confirm("Vill du radera uppgiften?")) deleteTodo(todo.id) }}
                      className="opacity-0 group-hover/todo:opacity-100 transition-opacity p-1 hover:text-red-500 rounded"
                      title="Radera"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddTodo(day)}
                className="mt-2 w-full text-left text-[10px] font-bold text-muted-foreground flex items-center gap-1 p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors group"
              >
                <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                NY UPPGIFT
              </button>
            </div>
          )
        })}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ny uppgift</DialogTitle>
            <DialogDescription>Planera in något för {selectedDate}.</DialogDescription>
          </DialogHeader>
          {selectedDate && <TodoForm date={selectedDate} onSuccess={() => setIsOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}


// _ _ _

// 2026-03-02 rev02

// "use client"

// import { useState } from "react"
// import {
//   addDays,
//   format,
//   startOfWeek,
//   subDays,
//   getWeek,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   endOfWeek,
//   isSameMonth,
//   isSameDay,
//   addMonths,
//   subMonths
// } from "date-fns"
// import { sv } from "date-fns/locale"
// import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog"
// import { TodoForm } from "./todo-form"

// // FEJKAD DATA (Detta kommer från databasen senare)
// const MOCK_TODOS = [
//   { id: "1", title: "Lunchmöte", date: "2026-03-02", time: "12:00", color: "blue" },
//   { id: "2", title: "Gymmet", date: "2026-03-02", time: "17:30", color: "green" },
//   { id: "3", title: "Handla mat", date: "2026-03-04", time: "16:00", color: "yellow" },
// ]

// // Hjälpfunktion för att mappa färg-namn till Tailwind-klasser
// const getColorClass = (color: string) => {
//   switch (color) {
//     case "blue": return "bg-blue-100 border-blue-200 text-blue-800"
//     case "green": return "bg-green-100 border-green-200 text-green-800"
//     case "yellow": return "bg-yellow-100 border-yellow-200 text-yellow-800"
//     case "red": return "bg-red-100 border-red-200 text-red-800"
//     case "purple": return "bg-purple-100 border-purple-200 text-purple-800"
//     default: return "bg-muted border-border text-foreground"
//   }
// }

// export function WeeklyView() {
//   const [view, setView] = useState<"week" | "month">("week")
//   const [currentDate, setCurrentDate] = useState(new Date())
//   const [isOpen, setIsOpen] = useState(false)
//   const [selectedDate, setSelectedDate] = useState<string | null>(null)

//   const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
//   const weekNumber = getWeek(weekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 })

//   const monthStart = startOfMonth(currentDate)
//   const monthEnd = endOfMonth(monthStart)
//   const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
//   const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
//   const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

//   const next = () => view === "week" ? setCurrentDate(addDays(currentDate, 7)) : setCurrentDate(addMonths(currentDate, 1))
//   const prev = () => view === "week" ? setCurrentDate(subDays(currentDate, 7)) : setCurrentDate(subMonths(currentDate, 1))

//   const handleAddTodo = (date: Date) => {
//     setSelectedDate(format(date, "yyyy-MM-dd"))
//     setIsOpen(true)
//   }

//   return (
//     <div className="flex flex-col h-full w-full bg-background">
//       {/* NAVIGATION (Header) */}
//       <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b bg-muted/20 gap-4">
//         <div className="flex items-center gap-4">
//           <div className="flex flex-col">
//             <h3 className="font-bold capitalize text-xl leading-none mb-1">
//               {format(currentDate, "MMMM yyyy", { locale: sv })}
//             </h3>
//             <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
//               <CalendarIcon className="h-3 w-3" />
//               {view === "week" ? `Vecka ${weekNumber}` : "Månadsöversikt"}
//             </span>
//           </div>

//           <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")} className="ml-4">
//             <TabsList className="grid w-[160px] grid-cols-2 h-8">
//               <TabsTrigger value="week" className="text-xs">Vecka</TabsTrigger>
//               <TabsTrigger value="month" className="text-xs">Månad</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         <div className="flex gap-2 items-center">
//           <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 text-xs font-bold">
//             IDAG
//           </Button>
//           <div className="flex items-center border rounded-md bg-background shadow-sm overflow-hidden">
//             <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none border-r"><ChevronLeft className="h-4 w-4" /></Button>
//             <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none"><ChevronRight className="h-4 w-4" /></Button>
//           </div>
//         </div>
//       </div>

//       {/* KALENDER-GRID */}
//       <div className={cn(
//         "grid flex-1 overflow-auto bg-border gap-[1px]",
//         view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-7"
//       )}>
//         {(view === "week" ? weekDays : monthDays).map((day) => {
//           const isToday = isSameDay(day, new Date())
//           const isCurrentMonth = isSameMonth(day, monthStart)
//           const dateStr = format(day, "yyyy-MM-dd")

//           // Filtrera fram uppgifter för just denna dag
//           const dayTodos = MOCK_TODOS.filter(todo => todo.date === dateStr)

//           return (
//             <div key={day.toString()} className={cn(
//               "flex flex-col min-h-[160px] p-2 transition-colors bg-background",
//               !isCurrentMonth && view === "month" && "bg-muted/30 text-muted-foreground/40"
//             )}>
//               {/* Datum-header */}
//               <div className="mb-2">
//                 {view === "week" ? (
//                   <div className={cn(
//                     "flex flex-col p-2 rounded-md w-full items-center border transition-all",
//                     isToday ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-muted/10 border-border"
//                   )}>
//                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
//                       {format(day, "eeee", { locale: sv })}
//                     </span>
//                     <span className="text-sm font-mono font-bold tracking-tighter">{dateStr}</span>
//                   </div>
//                 ) : (
//                   <div className={cn(
//                     "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
//                     isToday ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
//                   )}>
//                     {format(day, "d")}
//                   </div>
//                 )}
//               </div>

//               {/* LISTA MED UPPGIFTER */}
//               <div className="flex-1 space-y-1 overflow-y-auto">
//                 {dayTodos.map(todo => (
//                   <div
//                     key={todo.id}
//                     className={cn(
//                       "p-1.5 rounded border text-[11px] font-medium shadow-sm transition-all hover:brightness-95 cursor-pointer flex flex-col gap-0.5",
//                       getColorClass(todo.color)
//                     )}
//                   >
//                     <div className="flex items-center gap-1 opacity-70 italic font-bold">
//                       <Clock className="h-2.5 w-2.5" />
//                       {todo.time}
//                     </div>
//                     <div className="truncate">{todo.title}</div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => handleAddTodo(day)}
//                 className="mt-2 w-full text-left text-[10px] font-bold text-muted-foreground flex items-center gap-1 p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors group"
//               >
//                 <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
//                 NY UPPGIFT
//               </button>
//             </div>
//           )
//         })}
//       </div>

//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Ny uppgift</DialogTitle>
//             <DialogDescription>Lägg till en uppgift för {selectedDate}.</DialogDescription>
//           </DialogHeader>
//           {selectedDate && <TodoForm date={selectedDate} onSuccess={() => setIsOpen(false)} />}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


// _ _ _

// 2026-03-02 rev01

// "use client"

// import { useState } from "react"
// import {
//   addDays,
//   format,
//   startOfWeek,
//   subDays,
//   getWeek,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   endOfWeek,
//   isSameMonth,
//   isSameDay,
//   addMonths,
//   subMonths
// } from "date-fns"
// import { sv } from "date-fns/locale"
// import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog"
// import { TodoForm } from "./todo-form" // Se till att denna fil finns i samma mapp

// export function WeeklyView() {
//   const [view, setView] = useState<"week" | "month">("week")
//   const [currentDate, setCurrentDate] = useState(new Date())

//   const [isOpen, setIsOpen] = useState(false)
//   const [selectedDate, setSelectedDate] = useState<string | null>(null)

//   const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
//   const weekNumber = getWeek(weekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 })

//   const monthStart = startOfMonth(currentDate)
//   const monthEnd = endOfMonth(monthStart)
//   const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
//   const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
//   const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

//   const next = () => {
//     view === "week" ? setCurrentDate(addDays(currentDate, 7)) : setCurrentDate(addMonths(currentDate, 1))
//   }
//   const prev = () => {
//     view === "week" ? setCurrentDate(subDays(currentDate, 7)) : setCurrentDate(subMonths(currentDate, 1))
//   }

//   const handleAddTodo = (date: Date) => {
//     setSelectedDate(format(date, "yyyy-MM-dd"))
//     setIsOpen(true)
//   }

//   return (
//     <div className="flex flex-col h-full w-full bg-background">
//       <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b bg-muted/20 gap-4">
//         <div className="flex items-center gap-4">
//           <div className="flex flex-col">
//             <h3 className="font-bold capitalize text-xl leading-none mb-1 text-foreground">
//               {format(currentDate, "MMMM yyyy", { locale: sv })}
//             </h3>
//             <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
//               <CalendarIcon className="h-3 w-3" />
//               {view === "week" ? `Vecka ${weekNumber}` : "Månadsöversikt"}
//             </span>
//           </div>

//           <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")} className="ml-4">
//             <TabsList className="grid w-[160px] grid-cols-2 h-8">
//               <TabsTrigger value="week" className="text-xs">Vecka</TabsTrigger>
//               <TabsTrigger value="month" className="text-xs">Månad</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         <div className="flex gap-2 items-center">
//           <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 text-xs font-bold">
//             IDAG
//           </Button>
//           <div className="flex items-center border rounded-md bg-background shadow-sm overflow-hidden">
//             <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none border-r">
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none">
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className={cn(
//         "grid flex-1 overflow-auto bg-border gap-[1px]",
//         view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-7"
//       )}>
//         {(view === "week" ? weekDays : monthDays).map((day) => {
//           const isToday = isSameDay(day, new Date())
//           const isCurrentMonth = isSameMonth(day, monthStart)

//           return (
//             <div key={day.toString()} className={cn(
//               "flex flex-col min-h-[140px] p-2 transition-colors bg-background group",
//               !isCurrentMonth && view === "month" && "bg-muted/30 text-muted-foreground/40"
//             )}>
//               <div className="flex justify-between items-start mb-2">
//                 {view === "week" ? (
//                   <div className={cn(
//                     "flex flex-col p-2 rounded-md w-full items-center border transition-all",
//                     isToday ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-muted/10 border-border"
//                   )}>
//                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
//                       {format(day, "eeee", { locale: sv })}
//                     </span>
//                     <span className="text-sm font-mono font-bold tracking-tighter text-foreground">
//                       {format(day, "yyyy-MM-dd")}
//                     </span>
//                   </div>
//                 ) : (
//                   <div className={cn(
//                     "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all text-foreground",
//                     isToday ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
//                   )}>
//                     {format(day, "d")}
//                   </div>
//                 )}
//               </div>

//               <div className="flex-1 overflow-hidden px-1" />

//               <button
//                 onClick={() => handleAddTodo(day)}
//                 className="mt-2 w-full text-left text-[10px] font-bold text-muted-foreground flex items-center gap-1 p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors group"
//               >
//                 <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
//                 NY UPPGIFT
//               </button>
//             </div>
//           )
//         })}
//       </div>

//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Ny uppgift</DialogTitle>
//             <DialogDescription>
//               Lägg till en uppgift för {selectedDate}.
//             </DialogDescription>
//           </DialogHeader>
//           {selectedDate && (
//             <TodoForm
//               date={selectedDate}
//               onSuccess={() => setIsOpen(false)}
//             />
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// _ _ _

// 2026-03-02 rev00

// "use client"

// import { useState } from "react"
// import {
//   addDays,
//   format,
//   startOfWeek,
//   subDays,
//   getWeek,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   endOfWeek,
//   isSameMonth,
//   isSameDay,
//   addMonths,
//   subMonths
// } from "date-fns"
// import { sv } from "date-fns/locale"
// import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"

// export function WeeklyView() {
//   const [view, setView] = useState<"week" | "month">("week")
//   const [currentDate, setCurrentDate] = useState(new Date())

//   // --- LOGIK FÖR VECKOVY ---
//   const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
//   const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
//   const weekNumber = getWeek(weekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 })

//   // --- LOGIK FÖR MÅNADSVY ---
//   const monthStart = startOfMonth(currentDate)
//   const monthEnd = endOfMonth(monthStart)
//   const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
//   const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
//   const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

//   const next = () => {
//     view === "week" ? setCurrentDate(addDays(currentDate, 7)) : setCurrentDate(addMonths(currentDate, 1))
//   }
//   const prev = () => {
//     view === "week" ? setCurrentDate(subDays(currentDate, 7)) : setCurrentDate(subMonths(currentDate, 1))
//   }

//   return (
//     <div className="flex flex-col h-full w-full bg-background">
//       {/* ÖVRE NAVIGATION */}
//       <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b bg-muted/20 gap-4">
//         <div className="flex items-center gap-4">
//           <div className="flex flex-col">
//             <h3 className="font-bold capitalize text-xl leading-none mb-1">
//               {format(currentDate, "MMMM yyyy", { locale: sv })}
//             </h3>
//             <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
//               <CalendarIcon className="h-3 w-3" />
//               {view === "week" ? `Vecka ${weekNumber}` : "Månadsöversikt"}
//             </span>
//           </div>

//           <Tabs value={view} onValueChange={(v) => setView(v as "week" | "month")} className="ml-4">
//             <TabsList className="grid w-[160px] grid-cols-2 h-8">
//               <TabsTrigger value="week" className="text-xs">Vecka</TabsTrigger>
//               <TabsTrigger value="month" className="text-xs">Månad</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         <div className="flex gap-2 items-center">
//           <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 px-3 text-xs font-bold">
//             IDAG
//           </Button>
//           <div className="flex items-center border rounded-md bg-background shadow-sm overflow-hidden">
//             <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-none border-r">
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-none">
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* KALENDER-GRID */}
//       <div className={cn(
//         "grid flex-1 overflow-auto bg-border gap-[1px]",
//         view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-7"
//       )}>
//         {/* Veckodagsnamn (syns bara i månads-vy) */}
//         {view === "month" && ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map(d => (
//           <div key={d} className="bg-muted/50 p-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
//             {d}
//           </div>
//         ))}

//         {(view === "week" ? weekDays : monthDays).map((day) => {
//           const isToday = isSameDay(day, new Date())
//           const isCurrentMonth = isSameMonth(day, monthStart)

//           return (
//             <div key={day.toString()} className={cn(
//               "flex flex-col min-h-[140px] p-2 transition-colors bg-background",
//               !isCurrentMonth && view === "month" && "bg-muted/30 text-muted-foreground/40"
//             )}>

//               <div className="flex justify-between items-start mb-2">
//                 {view === "week" ? (
//                   <div className={cn(
//                     "flex flex-col p-2 rounded-md w-full items-center border transition-all",
//                     isToday
//                       ? "bg-primary text-primary-foreground shadow-md border-primary"
//                       : "bg-muted/10 border-border"
//                   )}>
//                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">
//                       {format(day, "eeee", { locale: sv })}
//                     </span>
//                     <span className="text-sm font-mono font-bold tracking-tighter">
//                       {format(day, "yyyy-MM-dd")}
//                     </span>
//                   </div>
//                 ) : (
//                   <div className={cn(
//                     "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
//                     isToday
//                       ? "bg-primary text-primary-foreground shadow-sm"
//                       : "hover:bg-muted"
//                   )}>
//                     {format(day, "d")}
//                   </div>
//                 )}
//               </div>

//               <div className="flex-1 overflow-hidden px-1">
//                 {/* Framtida rendering av todos/uppgifter */}
//               </div>

//               {/* Knappen visas nu hela tiden */}
//               <button className="mt-2 w-full text-left text-[10px] font-bold text-muted-foreground flex items-center gap-1 p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors group">
//                 <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
//                 NY UPPGIFT
//               </button>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }