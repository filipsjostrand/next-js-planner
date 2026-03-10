"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"

import { registerSchema, RegisterValues } from "@/lib/validations/auth"
import { adminAddUser } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AddUserButton() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  async function onSubmit(values: RegisterValues) {
    setError(null)
    setSuccess(null)

    const result = await adminAddUser(values)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Användaren har skapats framgångsrikt!")
      form.reset()
      // Vi väntar lite med att stänga modalen så användaren hinner se succé-meddelandet
      setTimeout(() => {
        setOpen(false)
        setSuccess(null)
      }, 1500)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        form.reset()
        setError(null)
        setSuccess(null)
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" />
          Lägg till användare
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Skapa ny användare</DialogTitle>
          <DialogDescription>
            Fyll i uppgifterna för att registrera en ny medlem i systemet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                <p>{success}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Namn</FormLabel>
                  <FormControl>
                    <Input placeholder="Förnamn Efternamn" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-500">E-post</FormLabel>
                    <FormControl>
                      <Input placeholder="namn@mail.se" type="email" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-500">Roll</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Välj roll" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="GUEST">GUEST</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Lösenord</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormDescription className="text-[10px]">Minst 8 tecken, en siffra & specialtecken.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-500">Familjegrupp (Valfritt)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="T.ex. Sjostrand"
                      {...field}
                      value={field.value ?? ""}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full rounded-xl font-bold mt-2"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Skapar konto..." : "Spara användare"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}