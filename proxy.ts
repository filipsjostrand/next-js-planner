// proxy.ts (Fungerar som middleware)
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  /*
   * Matcher-logik:
   * Vi skyddar allt UTOM:
   * 1. API-routes (så att register-API fungerar)
   * 2. Statiska filer (_next/static, _next/image, favicon.ico)
   * 3. Dina publika auth-sidor (login, register, forgot-password)
   */
  matcher: ["/((?!api|login|register|forgot-password|_next/static|_next/image|favicon.ico).*)"],
}