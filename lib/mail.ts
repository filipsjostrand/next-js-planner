import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Gemensam avsändaradress för din verifierade domän
const FROM_EMAIL = "Kallner Planering <noreply@99sleepideas.com>";

/**
 * Skickar verifieringsmejl vid nyregistrering
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/new-verification?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verifiera din e-post",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>Verifiera din e-post</h2>
          <p>Tack för att du registrerat dig på Kallner Planering!</p>
          <p>Klicka på knappen nedan för att verifiera ditt konto:</p>
          <a href="${confirmLink}"
             style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verifiera mitt konto
          </a>
          <p style="margin-top: 20px; font-size: 0.8em; color: #666;">
            Länk: ${confirmLink}
          </p>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend Error (Verification):", error.message);
      return null;
    }

    console.log("✅ Verifieringsmejl skickat! ID:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Mail Exception (Verification):", error);
    return null;
  }
};

/**
 * Skickar mejl för lösenordsåterställning
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/new-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Återställ ditt lösenord",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>Återställ lösenord</h2>
          <p>Vi har fått en förfrågan om att återställa lösenordet för ditt konto på Kallner Planering.</p>
          <p>Klicka på knappen nedan för att välja ett nytt lösenord:</p>
          <a href="${resetLink}"
             style="display: inline-block; padding: 10px 20px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Återställ lösenord
          </a>
          <p style="margin-top: 20px; font-size: 0.8em; color: #666;">
            Om du inte har begärt detta kan du ignorera detta mejl. Länken är giltig i 1 timme.
          </p>
          <p style="font-size: 0.8em; color: #666;">
            Direktlänk: ${resetLink}
          </p>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend Error (Reset):", error.message);
      return null;
    }

    console.log("✅ Återställningsmejl skickat! ID:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Mail Exception (Reset):", error);
    return null;
  }
};