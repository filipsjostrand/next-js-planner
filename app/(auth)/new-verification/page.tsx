// app/auth/new-verification/page.tsx

import { db } from "@/lib/db";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NewVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <StatusCard
      title="Hoppsan!"
      message="Verifieringstoken saknas."
      icon={<XCircle className="h-12 w-12 text-destructive" />}
    />;
  }

  // 1. Hitta token
  const existingToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return <StatusCard
      title="Ogiltig länk"
      message="Token är ogiltig eller har redan använts."
      icon={<XCircle className="h-12 w-12 text-destructive" />}
    />;
  }

  // 2. Kolla utgångsdatum
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return <StatusCard
      title="Utgången länk"
      message="Token har gått ut. Vänligen begär en ny verifiering."
      icon={<XCircle className="h-12 w-12 text-destructive" />}
    />;
  }

  // 3. Hitta användaren
  const existingUser = await db.user.findUnique({
    where: { email: existingToken.identifier },
  });

  if (!existingUser) {
    return <StatusCard
      title="E-post saknas"
      message="E-postadressen hittades inte i vårt system."
      icon={<XCircle className="h-12 w-12 text-destructive" />}
    />;
  }

  // 4. Utför verifieringen
  try {
    await db.$transaction([
      db.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: new Date(),
          email: existingToken.identifier,
        },
      }),
      db.verificationToken.delete({
        where: { token },
      }),
    ]);
  } catch (error) {
    return <StatusCard
      title="Fel vid verifiering"
      message="Kunde inte aktivera kontot just nu. Försök igen senare."
      icon={<XCircle className="h-12 w-12 text-destructive" />}
    />;
  }

  // LYCKAT RESULTAT
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-emerald-50 p-4 rounded-full mb-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Verifierat och klart!</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Din e-post har verifierats. Nu kan du logga in och börja planera med din familjegrupp.
      </p>
      <Link href="/login">
        <Button className="gap-2 px-8">
          Gå till inloggning
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

// En statisk hjälpkomponent för både fel och information
function StatusCard({ title, message, icon }: { title: string; message: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-slate-50 p-4 rounded-full mb-6">
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-muted-foreground mb-8">{message}</p>
      <Link href="/login">
        <Button variant="outline">Tillbaka till inloggning</Button>
      </Link>
    </div>
  );
}

// import { db } from "@/lib/db";
// import { redirect } from "next/navigation";

// export default async function NewVerificationPage({ searchParams }: { searchParams: { token: string } }) {
//   const { token } = await searchParams;

//   const existingToken = await db.verificationToken.findUnique({
//     where: { token }
//   });

//   if (!existingToken || new Date(existingToken.expires) < new Date()) {
//     return <div>Token har gått ut eller saknas.</div>;
//   }

//   const existingUser = await db.user.findUnique({
//     where: { email: existingToken.identifier }
//   });

//   if (!existingUser) return <div>E-post finns inte.</div>;

//   await db.user.update({
//     where: { id: existingUser.id },
//     data: {
//       emailVerified: new Date(),
//       email: existingToken.identifier, // Valfritt
//     }
//   });

//   await db.verificationToken.delete({
//     where: { token }
//   });

//   return (
//     <div className="p-10 text-center">
//       <h1 className="text-2xl font-bold">Ditt konto är nu verifierat!</h1>
//       <a href="/login" className="text-blue-500 underline">Logga in här</a>
//     </div>
//   );
// }