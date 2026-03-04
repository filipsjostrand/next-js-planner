import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 timme

  const existingToken = await db.verificationToken.findFirst({
    where: { identifier: email }
  });

  if (existingToken) {
    await db.verificationToken.delete({
      where: { token: existingToken.token },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  });

  return verificationToken;
};