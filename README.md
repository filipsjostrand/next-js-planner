📅 Källner Planering
En modern, fullstack-planeringsapplikation byggd med Next.js 15, Prisma och Tailwind CSS. Appen är designad för hushåll eller grupper som behöver en gemensam överblick över veckans aktiviteter med stöd för återkommande uppgifter och digitala post-it-lappar.

🚀 Funktioner
Vecko- & Månadsöversikt: Växla sömlöst mellan en detaljerad veckovy och en bredare månadsöversikt.

Återkommande Uppgifter: Stöd för dagliga, veckovisa (specifika dagar), månatliga och årliga upprepningar.

Användarvyer: Se och navigera mellan gruppmedlemmars scheman (Admin/Läs-läge).

Post-it Grid: En dedikerad sektion för snabba anteckningar som inte är bundna till specifika datum.

Rollbaserad Åtkomst: System för Admin, Användare och Gäster med olika behörighetsnivåer.

Responsive Design: Fullt optimerad för både desktop och mobila enheter med ett lekfullt men rent UI.

Dark Mode: Stöd för ljust och mörkt läge via next-themes.

🛠 Teknisk Stack
Framework: Next.js 15 (App Router)

Databas: Prisma ORM (PostgreSQL/MySQL/SQLite)

Autentisering: Auth.js (NextAuth)

Styling: Tailwind CSS

Komponenter: Shadcn/UI & Lucide React (ikoner)

Datumhantering: date-fns

Typsäkerhet: TypeScript

📦 Installation
Klona repot:

Bash
git clone https://github.com/ditt-användarnamn/kallner-planering.git
cd kallner-planering
Installera beroenden:

Bash
npm install
Miljövariabler:
Skapa en .env-fil i roten och lägg till följande:

Code snippet
DATABASE_URL="din-databas-url"
AUTH_SECRET="din-auth-secret" # Generera med: npx auth secret
Databas-setup:

Bash
npx prisma generate
npx prisma db push
Starta utvecklingsservern:

Bash
npm run dev
📂 Struktur
/app: Innehåller alla routes, inklusive huvudvyn (page.tsx) och API-actions.

/components/dashboard: Kärnkomponenter som WeeklyView, PostItGrid och UserSelector.

/components/ui: Återanvändbara UI-komponenter från Shadcn.

/lib: Konfiguration för Prisma (db.ts) och verktygsfunktioner.

/auth.ts: Logik för autentisering och sessioner.

📝 Licens
Detta projekt är privat och skapat för familjen Källners planering.