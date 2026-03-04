"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { requestPasswordReset } from "@/app/actions/password-reset"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      // Här anropar vi den riktiga funktionen i din password-reset.ts
      const result = await requestPasswordReset(email)

      if (result?.success) {
        setIsSent(true)
      } else {
        setError(result?.error || "Något gick fel. Försök igen senare.")
      }
    } catch (err) {
      setError("Ett oväntat fel uppstod.")
      console.error(err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Glömt lösenord?</CardTitle>
          <CardDescription className="text-center">
            Ange din e-postadress så skickar vi en länk för att återställa ditt konto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2 border border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="namn@outlook.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={isPending}
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Skickar..." : "Skicka återställningslänk"}
              </Button>
            </form>
          ) : (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-md border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-8 w-8 mx-auto" />
              <p className="text-sm font-medium">
                Om ett konto finns kopplat till <strong>{email}</strong> har vi skickat en återställningslänk dit.
              </p>
              <p className="text-xs text-emerald-700/80">
                Kolla även i skräpposten om du inte ser mejlet inom kort.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Tillbaka till inloggning
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}