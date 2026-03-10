"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, CheckCircle2, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { importTodos } from "@/app/actions/todo"

// Definiera samma interface här för att undvika 'any'
interface ImportedTodo {
  completed: boolean
  date: string
  time: string | null
  title: string
}

export function ImportTodos() {
  const [isPending, setIsPending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsPending(true)
    setStatus(null)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string
        const lines = text.split('\n').filter(line => line.trim() !== '')

        // Typa arrayen explicit som ImportedTodo[]
        const importedData: ImportedTodo[] = lines.map(line => {
          // Regex för att matcha: [Status] Datum (Tid): Titel
          const regex = /^\[(.*?)\]\s*(\d{4}-\d{2}-\d{2})(?:\s*\((.*?)\))?:\s*(.*)$/
          const match = line.match(regex)

          if (match) {
            return {
              completed: match[1].toLowerCase().includes("klar") && !match[1].toLowerCase().includes("ej"),
              date: match[2],
              time: match[3] || null,
              title: match[4].trim()
            }
          }

          // Fallback om raden inte följer formatet
          return {
            completed: false,
            date: new Date().toISOString().split('T')[0],
            time: null,
            title: line.trim()
          }
        })

        if (importedData.length === 0) throw new Error("Ingen data hittades")

        const res = await importTodos(importedData)
        if (res.success) {
          setStatus({ type: 'success', msg: `Importerat ${res.count} uppgifter!` })
        } else {
          setStatus({ type: 'error', msg: res.error || "Fel vid import." })
        }
      } catch (err) {
        setStatus({ type: 'error', msg: "Kunde inte läsa filen. Kontrollera formatet." })
      } finally {
        setIsPending(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Importera Textfil</h3>
        <p className="text-xs text-slate-600 italic">
          Format: [Ej klar] 2026-03-10 (12:00): Uppgiftens titel
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt"
          className="hidden"
        />

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Ladda upp .txt
        </Button>

        {status && (
          <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <FileWarning className="h-4 w-4 shrink-0" />
            )}
            <span>{status.msg}</span>
          </div>
        )}
      </div>
    </div>
  )
}