import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trash2, ArrowLeft, UserCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteTodo } from "@/app/actions/todo"; // Återanvänd din action
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // Hämta alla unika todos för användaren
  const userTodos = await db.todo.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Tillbaka till planeringen
        </Link>
        <h1 className="text-2xl font-bold">Inställningar & Hantering</h1>
      </div>

      {/* SEKTION: ALLA UPPGIFTER */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg text-black font-bold mb-4 flex items-center gap-2">
          Dina sparade uppgifter ({userTodos.length})
        </h2>
        <div className="divide-y text-black">
          {userTodos.length === 0 && <p className="text-muted-foreground text-sm">Inga uppgifter hittades.</p>}
          {userTodos.map((todo) => (
            <div key={todo.id} className="py-3 flex items-center justify-between group">
              <div>
                <p className="font-medium">{todo.title}</p>
                <p className="text-xs text-muted-foreground">
                  Start: {todo.date} | Repetition: {todo.recurrence}
                </p>
              </div>
              <form action={async () => {
                "use server";
                await db.todo.delete({ where: { id: todo.id } });
                revalidatePath("/settings");
              }}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* SEKTION: KONTOHANTERING */}
      <section className="bg-rose-50 border border-rose-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-rose-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Farlig zon
        </h2>
        <p className="text-sm text-rose-700 mb-4">
          När du raderar ditt konto tas all din data (todos och post-its) bort permanent. Detta går inte att ångra.
        </p>
        <form action={async () => {
          "use server";
          // Logik för att radera konto:
          // 1. Radera todos/postits
          // 2. Radera användaren från DB
          // 3. Logga ut/Redirect
        }}>
          <Button variant="destructive">Radera mitt konto permanent</Button>
        </form>
      </section>
    </div>
  );
}