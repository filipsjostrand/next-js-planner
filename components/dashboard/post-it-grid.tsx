"use client"

import { cn } from "@/lib/utils"

export function PostItGrid() {
  // Exempel-data (detta hämtas senare från din Postgres-databas)
  const postIts = [
    { id: "1", content: "Köp mjölk", color: "bg-yellow-200" },
    { id: "2", content: "Ring tandläkaren", color: "bg-blue-200" },
    { id: "3", content: "Fixa projektmallen", color: "bg-green-200" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {postIts.map((note) => (
        <div
          key={note.id}
          className={cn(
            "aspect-square p-4 shadow-md rotate-1 hover:rotate-0 transition-transform cursor-pointer border",
            note.color
          )}
        >
          <p className="text-sm font-medium text-slate-800 leading-tight">
            {note.content}
          </p>
        </div>
      ))}

      {/* Knapp för att skapa ny post-it */}
      <button className="aspect-square p-4 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
        + Ny lapp
      </button>
    </div>
  )
}