import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/providers/session-provider"; // Importera din nya provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Min Vecko-Planerare",
  description: "Organisera dina todos och post-its",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider> {/* Omsluter allt för att useSession ska fungera i Navbar */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}