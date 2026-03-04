import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Vi skapar en variabel för domänen.
// När du publicerar sidan ändrar du localhost till din riktiga domän.
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
  // VIKTIGT: Eftersom mappen heter (auth) med parenteser i Next.js,
  // så hoppar vi över "auth" i själva URL-länken.
  const confirmLink = `${domain}/new-verification?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev", // Byt till din domän senare i Resend-dashboarden
    to: email,
    subject: "Verifiera din e-post",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
        <h2>Verifiera din e-post</h2>
        <p>Tack för att du registrerat dig på Kallner Planering!</p>
        <p>Klicka på knappen nedan för att verifiera ditt konto och komma igång:</p>
        <a href="${confirmLink}"
           style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verifiera mitt konto
        </a>
        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">
          Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:<br />
          ${confirmLink}
        </p>
      </div>
    `
  });
};

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendVerificationEmail = async (email: string, token: string) => {
//   const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

//   await resend.emails.send({
//     from: "onboarding@resend.dev", // Byt till din domän senare
//     to: email,
//     subject: "Verifiera din e-post",
//     html: `<p>Klicka <a href="${confirmLink}">här</a> för att verifiera ditt konto på Kallner Planering.</p>`
//   });
// };