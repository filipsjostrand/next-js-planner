import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GroupManager } from "@/components/settings/group-manager";
import { TodoManager } from "@/components/settings/todo-manager";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

export default async function SettingsPage() {
  const session = await auth();

  // 1. Säkerställ att användaren är inloggad
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Hämta användaren, deras grupper och deras todos
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      groups: {
        select: {
          id: true,
          name: true,
        },
      },
      todos: {
        orderBy: {
          date: "asc"
        }
      }
    },
  });

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* RUBRIK */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-500">Inställningar</h1>
        <p className="text-muted-foreground">Hantera din profil, dina uppgifter och gruppanslutningar.</p>
      </div>

      <Separator />

      {/* PROFILSEKTION */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-500">Min Profil</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label className="text-xs uppercase text-muted-foreground font-bold">Namn</Label>
            <p className="text-lg font-medium text-slate-500">{user.name || "Inget namn"}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs uppercase text-muted-foreground font-bold">E-post</Label>
            <p className="text-lg font-medium text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* TODO-HANTERING */}
      <div className="space-y-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          {/* Typen matchar nu korrekt, så ingen TS-directive behövs */}
          <TodoManager initialTodos={user.todos} />
        </div>
      </div>

      <Separator />

      {/* GRUPPHANTERING */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-500">Hantera Grupper</h2>
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <GroupManager initialGroups={user.groups} />
        </div>
      </div>

      <Separator />

      {/* FARLIG ZON */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-red-600">Farlig zon</h2>
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-6 shadow-sm">
          <DeleteAccountSection />
        </div>
      </div>

      <div className="pt-4 text-center">
        <p className="text-xs text-muted-foreground italic">
          Kallner Planering — Version 1.0
        </p>
      </div>
    </div>
  );
}