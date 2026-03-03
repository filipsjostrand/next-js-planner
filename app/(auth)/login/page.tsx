"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Eye, EyeOff, CheckCircle2, UserCircle2, ArrowRight } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const successMessage = searchParams.get("success")

  // Vanlig inloggning (Admin/Medlem)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      setError("Fel e-post eller lösenord")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  // Snabb-inloggning för gäster (Kallner)
  const handleGuestLogin = async () => {
    setGuestLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: "guest-kallner@outlook.com",
      password: "KallnerGuest2026",
      redirect: false,
    })

    if (result?.error) {
      setError("Gästinloggning är inte tillgänglig för tillfället.")
      setGuestLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-primary">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Logga in</CardTitle>
        <CardDescription className="text-center">
          Hantera gruppens gemensamma schema
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {successMessage && !error && (
          <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-md flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center border border-destructive/20">
            {error}
          </div>
        )}

        {/* --- MEDLEMSINLOGGNING --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              placeholder="namn@outlook.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Lösenord</Label>
              <Link href="/forgot-password" size="xs" className="text-xs text-primary hover:underline font-medium">
                Glömt?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button className="w-full font-semibold" type="submit" disabled={loading || guestLoading}>
            {loading ? "Loggar in..." : "Logga in"}
          </Button>
        </form>

        {/* --- SEPARATOR --- */}
        <div className="w-full flex items-center gap-2 py-2">
          <div className="flex-1 h-[1px] bg-border" />
          <span className="text-[10px] uppercase text-muted-foreground font-bold whitespace-nowrap px-2">Eller</span>
          <div className="flex-1 h-[1px] bg-border" />
        </div>

        {/* --- GÄST-KNAPP (Förenklad utan fält) --- */}
        <div className="space-y-3">
          <Button
            variant="outline"
            type="button"
            className="w-full border-dashed group flex items-center justify-between py-8 px-4 hover:bg-slate-50 transition-all"
            onClick={handleGuestLogin}
            disabled={loading || guestLoading}
          >
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <UserCircle2 className="h-5 w-5 text-slate-600 group-hover:text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm">Titta som gäst</div>
                <div className="text-[11px] text-muted-foreground">Se grupp Kallners planering</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-primary" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col pt-0 pb-6">
        <div className="text-sm text-center text-muted-foreground pt-2">
          Saknar du konto?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Registrera dig
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<div>Laddar...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}