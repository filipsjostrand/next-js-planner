import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Namnet måste vara minst 2 tecken"),
  email: z.string().email("Ogiltig e-postadress"),
  password: z
    .string()
    .min(8, "Lösenordet måste vara minst 8 tecken")
    .regex(/[0-9]/, "Lösenordet måste innehålla minst en siffra")
    .regex(/[^a-zA-Z0-9]/, "Lösenordet måste innehålla minst ett specialtecken"),

  // Genom att använda .or(z.literal("")) utan .optional() tvingar vi fram en strängtyp
  groupName: z.string().or(z.literal("")),

  // Vi tar bort .default() här för att undvika att TS tror att rollen kan vara undefined
  role: z.enum(["USER", "GUEST"], {
    error: "Välj en giltig roll",
  }),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(1, "Lösenord krävs"),
});

export type LoginValues = z.infer<typeof loginSchema>;