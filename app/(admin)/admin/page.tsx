// app/(admin)/admin/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditUserButton } from "@/components/admin/edit-user-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft as ArrowLeftIcon, Shield, Users } from "lucide-react";

// --- TYPER ---
interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  // Eftersom Prisma-felet visade att det heter 'groups' (plural),
  // och det ofta är en array i Many-to-Many relationer:
  groups?: { name: string }[];
}

interface AdminGroup {
  id: string;
  name: string;
  createdAt: Date;
  _count: { users: number };
}

export default async function AdminPage() {
  // 1. DÖRRVAKT
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // 2. DATAHÄMTNING
  // Vi inkluderar bara 'groups' eftersom 'group' inte existerade i din modell
  const usersRaw = await db.user.findMany({
    include: {
      groups: true
    },
    orderBy: { createdAt: "desc" }
  });

  const groupsRaw = await db.group.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" }
  });

  const users = usersRaw as unknown as AdminUser[];
  const groups = groupsRaw as unknown as AdminGroup[];

  return (
    <div className="p-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Hantera konton för familjerna Sjostrand och Kallner.</p>
          </div>
        </div>

        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Tillbaka till start
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Användare ({users.length})
          </TabsTrigger>
          <TabsTrigger value="groups">Grupper ({groups.length})</TabsTrigger>
        </TabsList>

        {/* FLIK: ANVÄNDARE */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Användarkonton</CardTitle>
              <CardDescription>
                Här ser du alla registrerade användare och deras familjetillhörighet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Familjegrupp</TableHead>
                    <TableHead className="text-right">Åtgärd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    // Eftersom 'groups' är en array (Many-to-Many), hämtar vi första gruppens namn
                    const groupName = user.groups && user.groups.length > 0
                      ? user.groups[0].name
                      : null;

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name || <span className="text-muted-foreground italic text-xs">Inget namn</span>}
                            <EditUserButton id={user.id} currentName={user.name || ""} />
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "ADMIN" ? "default" : "outline"}
                            className={user.role === "ADMIN" ? "bg-amber-600 hover:bg-amber-700" : ""}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {groupName ? (
                            <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px] tracking-wider">
                              {groupName}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Ingen grupp</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DeleteButton id={user.id} type="user" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                        Inga användare hittades.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLIK: GRUPPER */}
        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Familjegrupper</CardTitle>
              <CardDescription>
                Systemets aktiva grupper. Radering av en grupp påverkar alla dess medlemmar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gruppnamn</TableHead>
                    <TableHead>Medlemmar</TableHead>
                    <TableHead>Skapad datum</TableHead>
                    <TableHead className="text-right">Åtgärd</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-bold text-slate-900">{group.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{group._count.users} medlemmar</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(group.createdAt).toLocaleDateString("sv-SE")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={group.id} type="group" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {groups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                        Inga grupper registrerade.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}