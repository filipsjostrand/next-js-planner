import { WeeklyView } from "@/components/dashboard/weekly-view";
import { PostItGrid } from "@/components/dashboard/post-it-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  // Här kommer vi senare hämta data från Prisma (server-side)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Välkommen tillbaka!</h1>
          <p className="text-muted-foreground">Här är dina planer för veckan.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Ny Post-it
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ny Todo
          </Button>
        </div>
      </div>

      {/* Veckovyn - Den stora kalendern */}
      <section className="rounded-xl border bg-card shadow-sm">
        <WeeklyView />
      </section>

      {/* Post-it sektionen - De lösa lapparna under schemat */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Mina Post-it lappar</h2>
        <PostItGrid />
      </section>
    </div>
  );
}