"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { registerSchema } from "@/lib/validations/auth"
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

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      groupName: "", // Lagt till default-värde
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await register(values)

      if (result?.error) {
        setError(result.error)
      } else {
        // Skicka användaren till login vid lyckad registrering
        router.push("/login?success=Kontot skapades! Logga in nedan.")
      }
    } catch (err) {
      setError("Något gick oväntat fel. Försök igen.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-6 border rounded-xl shadow-sm bg-white"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Skapa konto</h1>
            <p className="text-muted-foreground text-sm">Börja planera din vecka idag</p>
          </div>

          {error && (
            <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
              {error}
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Namn</FormLabel>
                <FormControl>
                  <Input placeholder="Ditt namn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-post</FormLabel>
                <FormControl>
                  <Input placeholder="namn@exempel.se" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* NYTT FÄLT: GRUPPNAMN */}
          <FormField
            control={form.control}
            name="groupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Familjens gruppnamn</FormLabel>
                <FormControl>
                  <Input placeholder="T.ex. Kallner" {...field} />
                </FormControl>
                <FormDescription>
                  Du måste ange namnet på gruppen du ska gå med i.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lösenord</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Skapar konto..." : "Registrera dig"}
          </Button>

          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Har du redan ett konto?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Logga in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  )
}