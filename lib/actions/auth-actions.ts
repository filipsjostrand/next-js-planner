"use client"

import { signIn } from "next-auth/react"

export async function login(formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/", // Skicka användaren till hem efteråt
  })
}