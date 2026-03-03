import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "USER"
      groupId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string              // LÄGG TILL DENNA RAD
    role: "ADMIN" | "USER"
    groupId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string              // LÄGG TILL DENNA RAD FÖR SÄKERHETS SKULL
    role: "ADMIN" | "USER"
    groupId: string | null
  }
}