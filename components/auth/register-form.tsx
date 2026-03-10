"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"

import { registerSchema, RegisterValues } from "@/lib/validations/auth"
import { register } from "@/app/actions/register"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CheckCircle2, AlertCircle, Eye, EyeOff, LayoutDashboard, Users } from "lucide-react"

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Genom att definiera typerna här tvingar vi React Hook Form att acceptera schemat
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      groupName: "",
      role: "USER",
    },
  })

  // Vi använder RegisterValues här för att säkerställa att onSubmit matchar formen
  async function onSubmit(values: RegisterValues) {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        const result = await register(values)

        if (result?.error) {
          setError(result.error)
        }

        if (result?.success) {
          setSuccess(result.success)
          form.reset()
        }
      } catch (err) {
        setError("Något gick oväntat fel. Försök igen.")
      }
    })
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 p-8 border rounded-2xl shadow-xl bg-white"
        >
          <div className="space-y-2 text-center pb-2">
            <div className="flex justify-center mb-2">
              <div className="bg-primary p-2 rounded-xl shadow-sm">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Skapa konto</h1>
            <p className="text-muted-foreground text-sm">Börja planera din vecka idag</p>
          </div>

          {error && (
            <div className="flex items-center gap-x-2 p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-xl animate-in fade-in duration-300">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-x-2 p-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl animate-in fade-in duration-300">
              <CheckCircle2 className="h-4 w-4" />
              <p>{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold uppercase text-slate-500 ml-1">Namn</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ditt namn"
                      {...field}
                      disabled={isPending}
                      className="rounded-xl h-11 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold uppercase text-slate-500 ml-1">E-post</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="namn@exempel.se"
                      type="email"
                      {...field}
                      disabled={isPending}
                      className="rounded-xl h-11 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem className="space-y-1 pt-1">
                  <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 ml-1">
                    <Users className="h-3 w-3 text-primary" />
                    Gruppnamn <span className="font-normal lowercase opacity-70">(Valfritt)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Välj något..."
                      disabled={isPending}
                      className="rounded-xl h-11 focus-visible:ring-primary"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] leading-tight ml-1">
                    Lämna tomt om du vill skapa eller gå med i en grupp senare.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold uppercase text-slate-500 ml-1">Lösenord</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        disabled={isPending}
                        className="pr-10 rounded-xl h-11 focus-visible:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isPending}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">
                          {showPassword ? "Dölj lösenord" : "Visa lösenord"}
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2"
            disabled={isPending}
          >
            {isPending ? "Skapar konto..." : "Registrera dig"}
          </Button>

          <div className="text-center text-sm pt-2">
            <p className="text-muted-foreground">
              Har du redan ett konto?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">
                Logga in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}