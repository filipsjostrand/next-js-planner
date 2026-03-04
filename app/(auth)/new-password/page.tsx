"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/app/actions/password-reset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react"

function NewPasswordContent() {
  const [password, setPassword] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("Återställningsnyckel saknas. Försök begära en ny länk.")
      return
    }

    setIsPending(true)
    setError("")

    try {
      const result = await resetPassword(token, password)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login?success=Ditt lösenord har uppdaterats!")
        }, 3000)
      }
    } catch (err) {
      setError("Något gick fel. Försök igen senare.")
    } finally {
      setIsPending(false)
    }
  }

  if (!token && !success) {
    return (
      <Card className="w-full max-w-[400px] border-t-4 border-t-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Ogiltig länk</p>
            <p className="text-sm text-muted-foreground">Den här länken saknar en säkerhetsnyckel eller är trasig.</p>
            <Button variant="outline" className="mt-2" onClick={() => router.push("/forgot-password")}>
              Begär ny länk
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Nytt lösenord</CardTitle>
        <CardDescription className="text-center">
          Välj ett nytt säkert lösenord för ditt konto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-md border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in">
            <CheckCircle2 className="h-8 w-8 mx-auto" />
            <p className="font-medium">Lösenordet har ändrats!</p>
            <p className="text-sm">Du skickas nu vidare till inloggningen...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2 border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nytt lösenord</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Minst 6 tecken"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="pl-9"
                  disabled={isPending}
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Sparar..." : "Uppdatera lösenord"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<div>Laddar...</div>}>
        <NewPasswordContent />
      </Suspense>
    </div>
  )
}