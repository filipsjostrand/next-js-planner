// lib/validations/auth.ts
import * as z from "zod"

export const registerSchema = z.object({
  email: z.string().email({
    message: "Vänligen ange en giltig e-postadress.",
  }),
  password: z
    .string()
    .min(8, { message: "Lösenordet måste vara minst 8 tecken." })
    .regex(/[A-Z]/, { message: "Måste innehålla minst en stor bokstav." })
    .regex(/[a-z]/, { message: "Måste innehålla minst en liten bokstav." })
    .regex(/[0-9]/, { message: "Måste innehålla minst en siffra." })
    .regex(/[^a-zA-Z0-9]/, { message: "Måste innehålla minst ett specialtecken." }),
})