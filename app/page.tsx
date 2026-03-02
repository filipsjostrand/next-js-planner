import { redirect } from "next/navigation";
import Link from "next/link";
import { WeeklyView } from "@/components/dashboard/weekly-view";
import { PostItGrid } from "@/components/dashboard/post-it-grid";
import { Button } from "@/components/ui/button";
import { PlusCircle, StickyNote, LogIn, ChevronDown } from "lucide-react";

// Fejkat inloggnings-check (byt ut mot auth() senare)
const getSession = async () => {
  // Returnera null för att testa inloggningsvyn, eller objektet för inloggat läge
  return { user: { name: "Filip", role: "USER" } };
};

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex flex-col w-full">
      {/* SEKTION 1: Veckoplanering (Helskärm) */}
      <section className="min-h-screen flex flex-col p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {session ? `Hej ${session.user.name}! 👋` : "Välkommen"}
            </h1>
            <p className="text-muted-foreground">
              {session ? "Här är din planering för veckan." : "Logga in för att se din planering."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!session ? (
              <Button asChild variant="default" size="lg" className="shadow-md">
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" /> Logga in
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <StickyNote className="mr-2 h-4 w-4" /> Ny Post-it
                </Button>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ny Todo
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Veckovyn - flex-1 gör att den fyller ut resten av skärmen */}
        <div className="flex-1 bg-card rounded-xl border shadow-xl overflow-hidden flex flex-col min-h-[600px]">
          {session ? (
            <WeeklyView />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground italic">Logga in för att visa kalendern</p>
            </div>
          )}
        </div>

        {/* Scroll-indikator */}
        <div className="flex flex-col items-center justify-center py-6 animate-bounce text-muted-foreground">
          <span className="text-[10px] uppercase tracking-[0.2em] mb-1">Scrolla för Post-its</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* SEKTION 2: Post-it sektionen (Ligger under "folden") */}
      <section className="min-h-[60vh] bg-muted/30 border-t border-border px-4 py-12 md:px-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 p-2 rounded-lg shadow-inner">
                <StickyNote className="h-6 w-6 text-yellow-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Post-it anteckningar</h2>
                <p className="text-sm text-muted-foreground text-balance">
                  Idéer och tankar som inte är knutna till en specifik tid.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background/50 rounded-2xl p-6 border border-dashed border-border">
            <PostItGrid />
          </div>
        </div>
      </section>

      {/* Footer / Copyright */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© 2026 Planerings-appen</p>
      </footer>
    </div>
  );
}