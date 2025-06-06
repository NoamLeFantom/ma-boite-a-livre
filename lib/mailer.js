import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // ou Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fonction existante pour envoyer un e-mail de validation
export function sendValidationEmail(to, token) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation-email?token=${token}`;

  return transporter.sendMail({
    from: `"Ma Boîte à Livre" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Confirmez votre adresse email",
    html: `
      <p>Merci pour votre inscription !</p>
      <p>Veuillez confirmer votre email en cliquant sur ce lien :</p>
      <a href="${confirmUrl}">Confirmer mon email</a>
    `,
  });
}

// Nouvelle fonction pour envoyer un e-mail de réinitialisation de mot de passe
export function sendResetPasswordEmail(to, token) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  return transporter.sendMail({
    from: `"Ma Boîte à Livre" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
      <p>Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
    `,
  });
}
