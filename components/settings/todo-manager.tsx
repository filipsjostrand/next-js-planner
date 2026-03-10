"use client"

import { useState } from "react"
import { Trash2, Calendar, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteTodo, deleteAllUserTodos } from "@/app/actions/todo"

interface Todo {
  id: string
  title: string
  date: string
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
}

interface TodoManagerProps {
  initialTodos: Todo[]
}

export function TodoManager({ initialTodos }: TodoManagerProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  const onDeleteOne = async (id: string) => {
    if (!confirm("Vill du radera denna uppgift?")) return

    setLoadingId(id)
    try {
      const res = await deleteTodo(id)
      if (res.success) {
        setTodos((prev) => prev.filter((t) => t.id !== id))
      } else {
        alert(res.error || "Kunde inte radera uppgiften")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingId(null)
    }
  }

  const onDeleteAll = async () => {
    if (!confirm("ÄR DU SÄKER? Detta raderar ALLA dina sparade uppgifter permanent.")) return

    setIsDeletingAll(true)
    try {
      const res = await deleteAllUserTodos()
      if (res.success) {
        setTodos([])
      } else {
        alert(res.error || "Något gick fel")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeletingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg text-black font-bold flex items-center gap-2 uppercase tracking-tight">
            Dina sparade uppgifter ({todos.length})
          </h2>
          <p className="text-xs text-muted-foreground">Hantera dina individuella planeringar</p>
        </div>
        {todos.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
            onClick={onDeleteAll}
            disabled={isDeletingAll || !!loadingId}
          >
            {isDeletingAll ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-3 w-3" />
            )}
            Radera alla
          </Button>
        )}
      </div>

      <div className="divide-y text-black max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {todos.length === 0 && (
          <div className="py-12 text-center border border-dashed rounded-xl bg-slate-50/50">
            <p className="text-muted-foreground text-sm font-medium">
              Inga sparade uppgifter hittades.
            </p>
          </div>
        )}

        {todos.map((todo) => (
          <div key={todo.id} className="py-4 flex items-center justify-between group transition-all">
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-900 leading-none">{todo.title}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                  <Calendar className="h-3 w-3 text-slate-400" /> {todo.date}
                </span>
                {todo.recurrence !== "NONE" && (
                  <span className="flex items-center gap-1 text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                    <RefreshCw className="h-3 w-3" /> {todo.recurrence}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => onDeleteOne(todo.id)}
              disabled={!!loadingId || isDeletingAll}
            >
              {loadingId === todo.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}