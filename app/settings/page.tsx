import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TodoManager } from "@/components/settings/todo-manager";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userTodos = await db.todo.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Tillbaka till planeringen
        </Link>
        <h1 className="text-3xl font-bold italic tracking-tighter">Inställningar</h1>
      </div>

      {/* SEKTION: HANTERA TODOS */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <TodoManager initialTodos={userTodos} />
      </section>

      {/* SEKTION: FARLIG ZON */}
      <section className="bg-rose-50 border border-rose-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-rose-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Farlig zon
        </h2>
        <p className="text-sm text-rose-700 mb-6">
          När du raderar ditt konto tas all din data bort permanent. Detta inkluderar alla dina planerade uppgifter och anteckningar.
        </p>
        <Button variant="destructive" className="font-bold">
          Radera mitt konto permanent
        </Button>
      </section>
    </div>
  );
}