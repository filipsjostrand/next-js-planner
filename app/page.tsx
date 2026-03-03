import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WeeklyView } from "@/components/dashboard/weekly-view";
import { PostItGrid } from "@/components/dashboard/post-it-grid";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { UserSelector } from "@/components/dashboard/user-selector";
import {
  PlusCircle,
  StickyNote,
  Calendar as CalendarIcon,
  User as UserIcon,
  ShieldAlert
} from "lucide-react";

export const dynamic = "force-dynamic";

// Gränssnitt för att slippa 'any'
interface Todo {
  id: string;
  title: string;
  date: Date | string;
  time: string | null;
  color: string;
  completed: boolean;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  userId: string;
}

interface PostIt {
  id: string;
  content: string;
  color: string;
  userId: string;
}

interface HomePageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();
  const resolvedParams = await searchParams;

  if (!session || !session.user) {
    redirect("/login");
  }

  const loggedInUserId = session.user.id;
  const viewUserId = resolvedParams.user || loggedInUserId;
  const isViewingOthers = viewUserId !== loggedInUserId;
  const isGuest = session.user.role === "GUEST";

  // Hämta data
  const [groupMembers, todosRaw, postItsRaw] = await Promise.all([
    db.user.findMany({
      where: { groupId: session.user.groupId },
      select: { id: true, name: true }
    }).catch(() => []),
    db.todo.findMany({
      where: { userId: viewUserId },
      orderBy: { date: 'asc' }
    }).catch(() => []),
    db.postIt.findMany({
      where: { userId: viewUserId }
    }).catch(() => [])
  ]);

  // Debug-loggar i terminalen
  console.log("--- DASHBOARD DEBUG ---");
  console.log("Visar data för:", viewUserId);
  console.log("Antal todos funna:", todosRaw.length);

  // Typsäker transformering (tar bort 'any')
  const serializedTodos = (todosRaw as unknown as Todo[]).map(todo => ({
    ...todo,
    date: todo.date instanceof Date
      ? todo.date.toISOString().split('T')[0]
      : String(todo.date).split('T')[0],
    recurrence: todo.recurrence || "NONE",
  }));

  const postIts = postItsRaw as unknown as PostIt[];
  const currentViewedUserName = groupMembers.find(m => m.id === viewUserId)?.name || session.user.name;

  return (
    <div className="flex flex-col w-full min-h-screen bg-yellow-100/50 text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl italic">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <span>Källner Planering</span>
          </div>

          <div className="flex items-center gap-3">
            {isGuest && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold animate-pulse">
                <ShieldAlert className="h-3 w-3" /> GÄSTLÄGE
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium">
              <UserIcon className="h-4 w-4 text-slate-400" />
              {session.user.name}
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isViewingOthers ? `Planering: ${currentViewedUserName}` : "Min Planering"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isViewingOthers ? `Visningsläge för ${currentViewedUserName}` : "Här är dina planer för veckan."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* NYA CLIENT-KOMPONENTEN FÖR VAL AV ANVÄNDARE */}
            <UserSelector
              members={groupMembers}
              currentViewId={viewUserId}
              loggedInUserId={loggedInUserId}
            />

            {!isViewingOthers && !isGuest && (
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
                <PlusCircle className="mr-2 h-4 w-4" /> Ny Uppgift
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          <WeeklyView
            initialTodos={serializedTodos}
            isReadOnly={isViewingOthers || isGuest}
            currentUserId={viewUserId}
          />
        </div>

        <section className="space-y-6 pt-10">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <div className="bg-yellow-400 p-3 rounded-2xl shadow-md">
              <StickyNote className="h-6 w-6 text-yellow-900" />
            </div>
            <h2 className="text-2xl font-bold">Post-its ({currentViewedUserName})</h2>
          </div>
          <div className="bg-slate-50/50 rounded-3xl p-6 border-2 border-dashed border-slate-200">
            <PostItGrid
              initialNotes={postIts}
              isReadOnly={isViewingOthers || isGuest}
              viewUserId={viewUserId}
            />
          </div>
        </section>
      </main>
    </div>
  );
}