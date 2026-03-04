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
import { EditUserButton } from "@/components/admin/edit-user-button"; // Tillagd
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { ArrowLeft } from "lucide-material"; // Kontrollera att din ikon-import stämmer, annars använd 'lucide-react'
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";

export default async function AdminPage() {
  // 1. DÖRRVAKT: Kontrollera att användaren är inloggad och är ADMIN
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // 2. DATAHÄMTNING: Hämta användare och grupper parallellt
  const [users, groups] = await Promise.all([
    db.user.findMany({
      include: { group: true },
      orderBy: { createdAt: "desc" }
    }),
    db.group.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="p-10 space-y-8 max-w-7xl mx-auto">
      {/* RUBRIK OCH TILLBAKA-KNAPP */}
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Hantera systemets användare och familjegrupper (Sjostrand, Kallner m.fl).
          </p>
        </div>

        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Tillbaka till planeringen
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="users">Användare ({users.length})</TabsTrigger>
          <TabsTrigger value="groups">Grupper ({groups.length})</TabsTrigger>
        </TabsList>

        {/* FLIK: ANVÄNDARE */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Användarkonton</CardTitle>
              <CardDescription>
                Här ser du alla som registrerat sig. Du kan ändra namn eller ta bort konton.
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.name}
                          <EditUserButton id={user.id} currentName={user.name} />
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.group?.name ? (
                          <Badge variant="secondary">{user.group.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Ingen grupp</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={user.id} type="user" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Inga användare hittades i databasen.
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
                Här hanteras grupperna. Om du raderar en grupp tas den bort för alla medlemmar.
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
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group._count.users} st</TableCell>
                      <TableCell>{new Date(group.createdAt).toLocaleDateString("sv-SE")}</TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={group.id} type="group" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {groups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        Inga grupper har skapats ännu.
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