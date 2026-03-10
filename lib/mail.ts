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
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Verifiera din e-post</h2>
          <p>Tack för att du registrerat dig på Kallner Planering!</p>
          <p>Klicka på knappen nedan för att verifiera ditt konto:</p>
          <a href="${confirmLink}"
             style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verifiera mitt konto
          </a>
          <p style="margin-top: 25px; font-size: 0.8em; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
            Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:<br>
            <span style="color: #0070f3;">${confirmLink}</span>
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
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Återställ lösenord</h2>
          <p>Vi har fått en förfrågan om att återställa lösenordet för ditt konto på Kallner Planering.</p>
          <p>Klicka på knappen nedan för att välja ett nytt lösenord:</p>
          <a href="${resetLink}"
             style="display: inline-block; padding: 12px 24px; background-color: #000; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Återställ lösenord
          </a>
          <p style="margin-top: 25px; font-size: 0.8em; color: #666;">
            Om du inte har begärt detta kan du ignorera detta mejl. Länken är giltig i 1 timme.
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

/**
 * Skickar välkomstmejl efter lyckad verifiering
 * FIX: Denna saknades och orsakade build-fel på Vercel
 */
export const sendWelcomeEmail = async (email: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Välkommen till Kallner Planering!",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Välkommen ombord!</h2>
          <p>Ditt konto på <strong>Kallner Planering</strong> är nu verifierat och klart att använda.</p>
          <p>Vi är glada att ha dig här! Nu kan du börja strukturera din vardag och dina uppgifter.</p>
          <div style="margin: 30px 0;">
            <a href="${domain}/auth/login"
               style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Logga in och börja planera
            </a>
          </div>
          <p style="font-size: 0.9em; color: #666;">
            Vänliga hälsningar,<br>Kallner Planering-teamet
          </p>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend Error (Welcome):", error.message);
      return null;
    }

    console.log("✅ Välkomstmejl skickat!");
    return data;
  } catch (error) {
    console.error("❌ Mail Exception (Welcome):", error);
    return null;
  }
};

/**
 * Skickar 2FA-kod (valfritt om du använder tvåfaktorsautentisering)
 */
export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Din 2FA-kod",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2>Tvåfaktorsautentisering</h2>
          <p>Din kod för att logga in är:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background-color: #f4f4f4; display: inline-block; border-radius: 8px;">
            ${token}
          </div>
          <p>Koden är giltig i 5 minuter.</p>
        </div>
      `
    });

    if (error) return null;
    return data;
  } catch {
    return null;
  }
};