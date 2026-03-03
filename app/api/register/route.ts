import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db"; // Se till att din prisma-klient exporteras som 'db' härifrån

export async function POST(req: Request) {
  try {
    const { email, password, name, groupName } = await req.json();

    // 1. Enkel validering av input
    if (!email || !password || !name || !groupName) {
      return NextResponse.json(
        { message: "Alla fält måste fyllas i." },
        { status: 400 }
      );
    }

    // 2. Kontrollera om användaren redan finns
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "E-postadressen är redan registrerad." },
        { status: 400 }
      );
    }

    // 3. Kontrollera om gruppen finns (t.ex. "Kallner")
    // Vi använder 'mode: insensitive' så att "kallner" och "Kallner" båda fungerar.
    const group = await db.group.findFirst({
      where: {
        name: {
          equals: groupName.trim(),
          mode: "insensitive",
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "Felaktigt gruppnamn. Du måste tillhöra en giltig familj." },
        { status: 403 }
      );
    }

    // 4. Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Skapa användaren och koppla till gruppen
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: "USER", // Standardroll för nya användare
        group: {
          connect: { id: group.id },
        },
      },
    });

    return NextResponse.json(
      { message: "Användare skapad!", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTRATION_ERROR:", error);
    return NextResponse.json(
      { message: "Något gick fel vid registreringen." },
      { status: 500 }
    );
  }
}