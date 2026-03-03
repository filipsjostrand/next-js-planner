import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [], // Fylls i av auth.ts (Node-miljön)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user

      // Definiera vilka rutter som är till för autentisering
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname.startsWith("/forgot-password")

      const isOnDashboard = nextUrl.pathname === "/"

      // 1. Om man försöker nå startsidan (planeringen) utan att vara inloggad
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Detta triggar redirect till pages.signIn (/login)
      }

      // 2. Om man är inloggad och försöker gå till login/register/forgot-password
      // Skicka till startsidan istället
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
      }

      // 3. Tillåt alla andra rutter (eller låt middleware matchern styra)
      return true
    },

    async jwt({ token, user }) {
      // 'user' skickas med här vid första inloggningen (från authorize i auth.ts)
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.groupId = user.groupId
      }
      return token
    },

    async session({ session, token }) {
      // Överför data från JWT till Session så att vi kommer åt det i client components (useSession)
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.groupId = token.groupId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login", // Vår custom login-sida
  },
} satisfies NextAuthConfig

// import type { NextAuthConfig } from "next-auth"

// export const authConfig = {
//   providers: [], // Vi lämnar denna tom här, den fylls i av auth.ts (Node-miljön)
//   callbacks: {
//     authorized({ auth, request: { nextUrl } }) {
//       const isLoggedIn = !!auth?.user
//       const isOnDashboard = nextUrl.pathname === "/"
//       const isAuthRoute = nextUrl.pathname.startsWith("/login")

//       // Om man är på startsidan och inte är inloggad -> skicka till login
//       if (isOnDashboard) {
//         if (isLoggedIn) return true
//         return false
//       }

//       // Om man är inloggad och försöker gå till login-sidan -> skicka till start
//       if (isAuthRoute && isLoggedIn) {
//         return Response.redirect(new URL("/", nextUrl))
//       }

//       return true
//     },
//     async jwt({ token, user }) {
//       // 'user' kommer från authorize-funktionen i auth.ts första gången man loggar in
//       if (user) {
//         token.id = user.id as string
//         token.role = user.role
//         token.groupId = user.groupId
//       }
//       return token
//     },
//     async session({ session, token }) {
//       // Här mappar vi från vår utökade JWT-typ till Session-typen
//       if (session.user && token) {
//         session.user.id = token.id
//         session.user.role = token.role
//         session.user.groupId = token.groupId
//       }
//       return session
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// } satisfies NextAuthConfig