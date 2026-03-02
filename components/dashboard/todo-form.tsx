"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const COLORS = [
  { name: "Standard", bg: "bg-card", border: "border-border", value: "default" },
  { name: "Blå", bg: "bg-blue-100", border: "border-blue-300", value: "blue" },
  { name: "Grön", bg: "bg-green-100", border: "border-green-300", value: "green" },
  { name: "Gul", bg: "bg-yellow-100", border: "border-yellow-300", value: "yellow" },
  { name: "Röd", bg: "bg-red-100", border: "border-red-300", value: "red" },
  { name: "Lila", bg: "bg-purple-100", border: "border-purple-300", value: "purple" },
]

export function TodoForm({ date, onSuccess }: { date: string, onSuccess: () => void }) {
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("12:00")
  const [selectedColor, setSelectedColor] = useState("default")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sparar uppgift:", {
      title,
      date,
      time,
      color: selectedColor
    })
    // Här läggs databasanropet till senare
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-4">
        {/* Titel */}
        <div className="space-y-2">
          <Label htmlFor="title">Vad behöver göras?</Label>
          <Input
            id="title"
            placeholder="Ex: Möte med teamet..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        {/* Tid */}
        <div className="space-y-2">
          <Label htmlFor="time">Tidpunkt</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Färgval */}
        <div className="space-y-2">
          <Label>Välj färg</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                  color.bg,
                  color.border,
                  selectedColor === color.value ? "ring-2 ring-ring ring-offset-2 scale-110" : "opacity-70 hover:opacity-100"
                )}
                title={color.name}
              >
                {selectedColor === color.value && <Check className="h-4 w-4 text-slate-900" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" type="button" onClick={onSuccess}>Avbryt</Button>
        <Button type="submit">Spara i kalendern</Button>
      </div>
    </form>
  )
}

// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// export function TodoForm({ date, onSuccess }: { date: string, onSuccess: () => void }) {
//   const [title, setTitle] = useState("")

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     console.log("Sparar todo:", { title, date })
//     // Här kommer vi senare lägga till Prisma-anropet
//     onSuccess()
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 pt-4">
//       <div className="space-y-2">
//         <Label htmlFor="title">Vad behöver göras?</Label>
//         <Input
//           id="title"
//           placeholder="Ex: Handla mat..."
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           autoFocus
//         />
//       </div>
//       <div className="flex justify-end gap-2">
//         <Button type="submit">Spara uppgift</Button>
//       </div>
//     </form>
//   )
// }