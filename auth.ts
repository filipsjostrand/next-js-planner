import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Enkel validering av indata
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).toLowerCase().trim()

        try {
          // 2. Hämta användaren från databasen
          const user = await db.user.findUnique({
            where: { email },
          })

          // 3. Om användaren inte finns eller saknar lösenord (t.ex. vid OAuth)
          if (!user || !user.password) {
            console.log("❌ Inloggning misslyckades: Användaren hittades inte");
            return null
          }

          // 4. Jämför det inskickade lösenordet med hashen i DB
          const isPasswordValid = await bcrypt.compare(
            String(credentials.password),
            user.password
          )

          if (!isPasswordValid) {
            console.log("❌ Inloggning misslyckades: Fel lösenord");
            return null
          }

          // 5. Returnera ett objekt som matchar din 'User' typ i next-auth.d.ts
          // Detta objekt hamnar sedan i JWT-token och sessionen
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,         // Från ditt Enum: ADMIN | USER
            groupId: user.groupId,   // Kan vara string eller null
          }
        } catch (error) {
          console.error("Auth error under authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    // Överför data från User-objektet (ovan) till JWT-token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.groupId = user.groupId
      }
      return token
    },
    // Överför data från JWT-token till Session-objektet (som du använder i frontend)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "USER"
        session.user.groupId = token.groupId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login", // Dirigera användaren hit vid fel eller behov av login
  },
})