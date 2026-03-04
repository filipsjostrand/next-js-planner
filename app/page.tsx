import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WeeklyView, type Todo } from "@/components/dashboard/weekly-view";
import { PostItGrid } from "@/components/dashboard/post-it-grid";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { UserSelector } from "@/components/dashboard/user-selector";
import { AddTodoButton } from "@/components/dashboard/add-todo-button";
import {
  StickyNote,
  Calendar as CalendarIcon,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// --- TYPER ---
interface PostIt {
  id: string;
  content: string;
  color: string;
  userId: string;
}

type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

interface PrismaTodo {
  id: string;
  title: string;
  date: string;
  time: string | null;
  color: string;
  completed: boolean;
  recurrence: string; // Från DB är detta en sträng
  interval: number;
  daysOfWeek: string | null;
  userId: string;
}

interface GroupMember {
  id: string;
  name: string | null;
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

  const loggedInUserId = session.user.id as string;
  const userRole = (session.user as { role?: string }).role;
  const userGroupId = (session.user as { groupId?: string }).groupId;

  const viewUserId = resolvedParams.user || loggedInUserId;

  const isReadOnly = userRole === "GUEST";
  const isAdmin = userRole === "ADMIN";
  const isViewingOthers = viewUserId !== loggedInUserId;

  const [groupMembers, todosRaw, postItsRaw] = await Promise.all([
    db.user.findMany({
      where: { groupId: userGroupId || "" },
      select: { id: true, name: true }
    }) as Promise<GroupMember[]>,

    db.todo.findMany({
      where: { userId: viewUserId },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    }) as Promise<PrismaTodo[]>,

    db.postIt.findMany({
      where: { userId: viewUserId }
    }) as Promise<PostIt[]>
  ]);

  const serializedTodos: Todo[] = (todosRaw || []).map((todo: PrismaTodo): Todo => {
    const dateString = todo.date ? todo.date.split('T')[0] : "";

    // Säker typ-castning av recurrence istället för any
    const recurrence = (["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(todo.recurrence)
      ? todo.recurrence
      : "NONE") as RecurrenceType;

    return {
      id: todo.id,
      title: todo.title,
      date: dateString,
      time: todo.time,
      color: todo.color,
      completed: todo.completed,
      recurrence: recurrence,
      interval: todo.interval,
      daysOfWeek: todo.daysOfWeek,
      userId: todo.userId
    };
  });

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
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}

            {isReadOnly && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold">
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
          </div>

          <div className="flex items-center gap-3">
            <UserSelector
              members={groupMembers.map(m => ({ id: m.id, name: m.name || "Namnlös" }))}
              currentViewId={viewUserId}
              loggedInUserId={loggedInUserId}
            />

            {!isReadOnly && (
              <AddTodoButton userId={viewUserId} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          <WeeklyView
            initialTodos={serializedTodos}
            isReadOnly={isReadOnly}
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
              initialNotes={postItsRaw}
              isReadOnly={isReadOnly}
              viewUserId={viewUserId}
            />
          </div>
        </section>
      </main>
    </div>
  );
}