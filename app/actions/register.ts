"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { registerSchema } from "@/lib/validations/auth"
import { z } from "zod"

export async function register(values: z.infer<typeof registerSchema>) {
  // 1. Validera på serversidan (Inklusive groupName och role)
  const validatedFields = registerSchema.safeParse(values)
  if (!validatedFields.success) return { error: "Ogiltiga fält" }

  // Vi hämtar ut 'role' här. Om du inte skickar roll från formuläret
  // kommer Zod-schemats .default("USER") att kicka in.
  const { email, password, name, groupName, role } = validatedFields.data

  try {
    // 2. Kontrollera om gruppen finns i databasen
    const existingGroup = await db.group.findFirst({
      where: {
        name: {
          equals: groupName.trim(),
          mode: "insensitive",
        },
      },
    })

    if (!existingGroup) {
      return {
        error: "Felaktigt gruppnamn. Du måste tillhöra en giltig familj för att registrera dig."
      }
    }

    // 3. Kontrollera om användaren redan finns
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return { error: "E-postadressen används redan" }

    // 4. Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. Skapa användaren med vald roll (USER eller GUEST)
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Här använder vi rollen från valideringen
        role: role as "USER" | "GUEST",
        group: {
          connect: { id: existingGroup.id }
        }
      }
    })

  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Något gick fel i databasen" }
  }

  // Skicka till login
  redirect("/login?success=Konto skapat! Logga in med dina uppgifter.")
}

// "use server"

// import { db } from "@/lib/db"
// import bcrypt from "bcryptjs"
// import { redirect } from "next/navigation"
// import { registerSchema } from "@/lib/validations/auth"
// import { z } from "zod"

// export async function register(values: z.infer<typeof registerSchema>) {
//   // 1. Validera igen på serversidan (Inklusive groupName)
//   const validatedFields = registerSchema.safeParse(values)
//   if (!validatedFields.success) return { error: "Ogiltiga fält" }

//   const { email, password, name, groupName } = validatedFields.data

//   try {
//     // 2. Kontrollera om gruppen finns i databasen
//     const existingGroup = await db.group.findFirst({
//       where: {
//         name: {
//           equals: groupName.trim(),
//           mode: "insensitive", // Gör sökningen okänslig för stora/små bokstäver
//         },
//       },
//     })

//     if (!existingGroup) {
//       return {
//         error: "Felaktigt gruppnamn. Du måste tillhöra en giltig familj för att registrera dig."
//       }
//     }

//     // 3. Kontrollera om användaren redan finns
//     const existingUser = await db.user.findUnique({ where: { email } })
//     if (existingUser) return { error: "E-postadressen används redan" }

//     // 4. Hasha lösenordet
//     const hashedPassword = await bcrypt.hash(password, 10)

//     // 5. Skapa användaren och koppla till den hittade gruppen
//     await db.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         role: "USER",
//         group: {
//           connect: { id: existingGroup.id }
//         }
//       }
//     })

//   } catch (error) {
//     console.error("Register Error:", error)
//     return { error: "Något gick fel i databasen" }
//   }

//   // Om allt går bra, skicka användaren till login
//   redirect("/login?success=Konto skapat! Logga in med dina uppgifter.")
// }