import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // ou Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendValidationEmail(to, token) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Ma Boîte à Livre" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Confirmez votre adresse email",
      html: `
        <p>Merci pour votre inscription !</p>
        <p>Veuillez confirmer votre email en cliquant sur ce lien :</p>
        <a href="${confirmUrl}">Confirmer mon email</a>
      `,
    });
    console.log("Email envoyé :", info.messageId);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }
}
