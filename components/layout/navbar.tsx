"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Calendar, Settings, LayoutDashboard, User, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/auth/logout-button"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === "ADMIN"

  const navItems = [
    {
      label: "Planering",
      href: "/",
      icon: Calendar
    },
    {
      label: "Inställningar",
      href: "/settings",
      icon: Settings
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">

        {/* VÄNSTER SIDA: LOGO & NAVIGERING */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80 shrink-0">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-sm">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight text-slate-900">
              VeckoPlanen
            </span>
          </Link>

          <nav className="flex items-center space-x-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xs:inline">{item.label}</span>
                </Link>
              )
            })}

            {/* ADMIN-LÄNK: Visas endast för administratörer */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ml-1",
                  pathname.startsWith("/admin")
                    ? "bg-amber-100 text-amber-700 font-bold shadow-sm"
                    : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden xs:inline">Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* HÖGER SIDA: ANVÄNDARE & LOGOUT */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className={cn(
              "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors mr-2",
              pathname === "/settings" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <User className="h-4 w-4" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-semibold">{session?.user?.name || "Konto"}</span>
              {isAdmin && <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Admin</span>}
            </div>
          </Link>

          <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          <LogoutButton />
        </div>
      </div>
    </header>
  )
}