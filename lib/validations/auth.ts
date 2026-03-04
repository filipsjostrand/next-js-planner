import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Namnet måste vara minst 2 tecken"),

  // I Zod 4 använder man z.email() direkt enligt din dokumentation
  email: z.email({ message: "Ogiltig e-postadress" }),

  password: z
    .string()
    .min(8, "Lösenordet måste vara minst 8 tecken")
    .regex(/[0-9]/, "Lösenordet måste innehålla minst en siffra")
    .regex(/[^a-zA-Z0-9]/, "Lösenordet måste innehålla minst ett specialtecken"),

  groupName: z
    .string()
    .min(1, "Du måste ange en giltig grupp (t.ex. Kallner)"),

  // Enligt dokumentationen skickas arrayen direkt.
  // För felmeddelanden i Zod 4 används ofta det här mönstret:
  role: z.enum(["USER", "GUEST"], {
    error: (issue) => "Välj en giltig roll (Medlem eller Gäst)"
  }),
});

export const loginSchema = z.object({
  // Samma här, använd z.email() direkt
  email: z.email({ message: "Ogiltig e-postadress" }),

  password: z
    .string()
    .min(1, "Lösenord krävs"),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

// import * as z from "zod";

// export const registerSchema = z.object({
//   name: z
//     .string()
//     .min(2, "Namnet måste vara minst 2 tecken"),

//   email: z
//     .string()
//     .email("Ogiltig e-postadress"),

//   password: z
//     .string()
//     .min(8, "Lösenordet måste vara minst 8 tecken")
//     .regex(/[0-9]/, "Lösenordet måste innehålla minst en siffra")
//     .regex(/[^a-zA-Z0-9]/, "Lösenordet måste innehålla minst ett specialtecken"),

//   groupName: z
//     .string()
//     .min(1, "Du måste ange en giltig grupp (t.ex. Kallner)"),

//   // FÖRENKLAD ENUM FÖR ATT MATCHA DIN ZOD-VERSION:
//   // Vi skickar bara meddelandet som en sträng i objektet 'message'
//   role: z
//     .enum(["USER", "GUEST"], {
//       message: "Välj en giltig roll (Medlem eller Gäst)",
//     })
//     .default("USER"),
// });

// export const loginSchema = z.object({
//   email: z
//     .string()
//     .email("Ogiltig e-postadress"),

//   password: z
//     .string()
//     .min(1, "Lösenord krävs"),
// });

// export type RegisterValues = z.infer<typeof registerSchema>;
// export type LoginValues = z.infer<typeof loginSchema>;