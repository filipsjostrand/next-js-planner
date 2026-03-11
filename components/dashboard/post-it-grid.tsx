"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Plus, Trash2, Lock, Loader2 } from "lucide-react"
import { savePostIt, deletePostIt } from "@/app/actions/post-it-actions"
import { debounce } from "lodash"

interface PostIt {
  id: string
  content: string
  color: string
  userId: string
}

interface PostItGridProps {
  initialNotes: PostIt[]
  isReadOnly?: boolean
  viewUserId: string
}

export function PostItGrid({ initialNotes, isReadOnly = false, viewUserId }: PostItGridProps) {
  const [notes, setNotes] = useState<PostIt[]>(initialNotes)
  const [isSaving, setIsSaving] = useState(false)

  // Vi använder useMemo för att skapa den debouncade funktionen.
  // Detta löser felet "Expected the first argument to be an inline function expression".
  const debouncedSave = useMemo(
    () =>
      debounce(async (id: string, content: string, userId: string, color: string) => {
        setIsSaving(true)
        try {
          await savePostIt(id, content, userId, color)
        } catch (error) {
          console.error("Kunde inte spara Post-it:", error)
        } finally {
          setIsSaving(false)
        }
      }, 1000),
    []
  )

  // Städa upp debouncen om komponenten försvinner (unmount)
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  const addNote = () => {
    if (isReadOnly) return
    const newNote: PostIt = {
      id: crypto.randomUUID(),
      content: "",
      color: "bg-yellow-200",
      userId: viewUserId
    }
    setNotes([newNote, ...notes])
    // Spara den tomma lappen direkt så den får en plats i DB
    savePostIt(newNote.id, "", viewUserId, newNote.color)
  }

  const handleTextChange = (id: string, content: string, color: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n))
    debouncedSave(id, content, viewUserId, color)
  }

  const removeNote = async (id: string) => {
    if (isReadOnly) return
    if (!confirm("Vill du radera lappen?")) return

    setNotes(notes.filter(n => n.id !== id))
    await deletePostIt(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        {isReadOnly ? (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
            <Lock className="h-3 w-3" /> LÄSLÄGE
          </div>
        ) : (
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-3 w-3 rounded-full bg-green-400" />}
            {isSaving ? "Sparar..." : "Allt sparat"}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className={cn(
              "aspect-square p-4 dark:bg-amber-200 shadow-xl transition-all flex flex-col group relative border-t-4 border-black/5",
              note.color || "bg-yellow-200",
              !isReadOnly && "hover:scale-105",
              index % 2 === 0 ? "rotate-2" : "-rotate-1"
            )}
          >
            {/* "Tejpen" på toppen av Post-it lappen */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 backdrop-blur-sm shadow-sm rotate-2 border border-black/5" />

            <textarea
              className={cn(
                "flex-1 bg-transparent border-none resize-none focus:outline-none text-sm font-medium text-slate-800 leading-tight placeholder:text-black",
                isReadOnly && "cursor-default"
              )}
              placeholder={isReadOnly ? "" : "Skriv något..."}
              value={note.content}
              onChange={(e) => handleTextChange(note.id, e.target.value, note.color)}
              spellCheck={false}
              readOnly={isReadOnly}

            />

            {!isReadOnly && (
              <div className="flex justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={() => removeNote(note.id)} className="text-slate-500 hover:text-red-600 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {!isReadOnly && (
          <button
            onClick={addNote}
            className="aspect-square p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all gap-2"
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider">Ny lapp</span>
          </button>
        )}
      </div>
    </div>
  )
}