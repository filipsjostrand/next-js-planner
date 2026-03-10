// auth.ts (i roten)

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
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).toLowerCase().trim()

        try {
          const user = await db.user.findUnique({
            where: { email },
            // Om du vill ha med grupper i framtiden, lägg till: include: { groups: true }
          })

          if (!user || !user.password) {
            console.log("❌ Inloggning misslyckades: Användaren hittades inte");
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            String(credentials.password),
            user.password
          )

          if (!isPasswordValid) {
            console.log("❌ Inloggning misslyckades: Fel lösenord");
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            // groupId: user.groupId, // BORTTAGEN: Detta fält finns inte i din Prisma-modell
          }
        } catch (error) {
          console.error("Auth error under authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        const existingUser = await db.user.findUnique({
          where: { id: user.id }
        });

        if (!existingUser) return false;

        if (existingUser.role === "ADMIN" || existingUser.role === "GUEST") {
          return true;
        }

        if (!existingUser.emailVerified) {
          throw new Error("Vänligen verifiera din e-post innan du loggar in.");
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // token.groupId = user.groupId // BORTTAGEN: Orsakar TypeScript-fel
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "USER" | "GUEST"
        // session.user.groupId = token.groupId as string | null // BORTTAGEN
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})