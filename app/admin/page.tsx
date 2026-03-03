// export default async function AdminPage() {
//   const groups = await db.group.findMany({ include: { users: true } });

//   return (
//     <div className="p-8 space-y-8">
//       <h1 className="text-4xl font-bold">Admininstration</h1>

//       <div className="grid gap-6">
//         {groups.map(group => (
//           <div key={group.id} className="border p-6 rounded-xl bg-card">
//             <h2 className="text-xl font-bold mb-4">{group.name}</h2>
//             <div className="space-y-2">
//               {group.users.map(user => (
//                 <div key={user.id} className="flex justify-between items-center bg-muted p-2 rounded">
//                   <span>{user.name} ({user.email})</span>
//                   <Button variant="destructive" size="sm">Ta bort</Button>
//                 </div>
//               ))}
//             </div>
//             <Button className="mt-4" variant="outline">+ Lägg till användare</Button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }