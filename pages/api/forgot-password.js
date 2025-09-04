import { getDb } from "@/lib/mongodb";
import { sendResetPasswordEmail } from "@/lib/mailer"; // Importez votre module mailer.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "L'adresse e-mail est requise." });
  }

  try {
    const db = await getDb();
    const user = await db.collection("Users").findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Générer un token de réinitialisation
    const resetToken = Math.random().toString(36).substr(2);
    await db.collection("Users").updateOne(
      { email },
      { $set: { resetToken, resetTokenExpiry: Date.now() + 3600000 } } // Expire dans 1 heure
    );

    // Construire le lien de réinitialisation
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    // Envoyer l'e-mail
    await sendResetPasswordEmail(email, resetToken);

    res.status(200).json({ message: "Lien de réinitialisation envoyé." });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}