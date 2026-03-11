import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WeeklyView, type Todo } from "@/components/dashboard/weekly-view";
import { PostItGrid } from "@/components/dashboard/post-it-grid";
import { Button } from "@/components/ui/button";
import { UserSelector } from "@/components/dashboard/user-selector";
import { AddTodoButton } from "@/components/dashboard/add-todo-button";
import {
  StickyNote,
  Users,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
  endTime: string | null;
  color: string;
  completed: boolean;
  recurrence: string;
  interval: number;
  daysOfWeek: string | null;
  userId: string;
  groupIdentifier?: string | null;
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

  // 1. Hämta den inloggade användaren och dess grupper
  const currentUserData = await db.user.findUnique({
    where: { id: loggedInUserId },
    include: {
      groups: {
        select: { id: true, name: true }
      }
    }
  });

  const userGroups = currentUserData?.groups || [];
  const groupIds = userGroups.map(g => g.id);
  const viewUserId = resolvedParams.user || loggedInUserId;

  const isReadOnly = userRole === "GUEST";
  const isViewingOthers = viewUserId !== loggedInUserId;

  // 2. Hämta data parallellt
  const [groupMembersRaw, todosRaw, postItsRaw] = await Promise.all([
    groupIds.length > 0
      ? db.user.findMany({
          where: {
            groups: { some: { id: { in: groupIds } } }
          },
          select: {
            id: true,
            name: true,
            groups: { select: { name: true } }
          },
          orderBy: { name: 'asc' }
        })
      : Promise.resolve([]),

    db.todo.findMany({
      where: { userId: viewUserId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    }) as Promise<PrismaTodo[]>,

    db.postIt.findMany({
      where: { userId: viewUserId }
    }) as Promise<PostIt[]>
  ]);

  // Transformera medlemmar för UserSelector
  const groupMembers = groupMembersRaw.map(m => ({
    id: m.id,
    name: m.name,
    groupNames: m.groups.map(g => g.name).join(", ")
  }));

  // 3. Serialisera todos
  const serializedTodos: Todo[] = (todosRaw || []).map((todo: PrismaTodo): Todo => {
    const dateString = todo.date ? todo.date.split('T')[0] : "";
    const recurrence = (["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(todo.recurrence)
      ? todo.recurrence
      : "NONE") as RecurrenceType;

    return {
      id: todo.id,
      title: todo.title,
      date: dateString,
      time: todo.time,
      endTime: todo.endTime,
      color: todo.color,
      completed: todo.completed,
      recurrence: recurrence,
      interval: todo.interval,
      daysOfWeek: todo.daysOfWeek,
      userId: todo.userId,
      groupIdentifier: todo.groupIdentifier || null
    };
  });

  const currentViewedUserName = groupMembers.find(m => m.id === viewUserId)?.name || session.user.name;

  return (
    <div className="flex flex-col w-full min-h-screen bg-yellow-100/30 text-slate-900">
      <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-8">

        {/* INFO-RUTOR OM MAN INTE HAR EN GRUPP */}
        {userGroups.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-xl text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Du tillhör ingen grupp än</h3>
                <p className="text-blue-700 text-sm">Gå med i din familjs grupp för att se andras planering.</p>
              </div>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-xl transition-all active:scale-95">
              <Link href="/settings" className="flex items-center gap-2">
                Gå till inställningar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-balance">
              {isViewingOthers ? `Planering: ${currentViewedUserName}` : "Min Planering"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <UserSelector
              members={groupMembers}
              currentViewId={viewUserId}
              loggedInUserId={loggedInUserId}
            />

            {!isReadOnly && (
              <AddTodoButton userId={viewUserId} groups={userGroups} />
            )}
          </div>
        </div>

        {/* KALENDERVY */}
        <div className="bg-white dark:bg-black rounded-3xl border border-slate-200 dark:border-gray-600 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          <WeeklyView
            initialTodos={serializedTodos}
            isReadOnly={isReadOnly}
            currentUserId={viewUserId}
            groups={userGroups}
          />
        </div>

        {/* POST-IT SEKTION */}
        <section className="space-y-6 pt-10">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <div className="bg-yellow-400 p-3 rounded-2xl shadow-md">
              <StickyNote className="h-6 w-6 text-yellow-900" />
            </div>
            <h2 className="text-2xl font-bold">Post-its ({currentViewedUserName})</h2>
          </div>
          <div className="bg-slate-50/50 dark:bg-black rounded-3xl p-6 border-2 border-dashed border-slate-200">
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