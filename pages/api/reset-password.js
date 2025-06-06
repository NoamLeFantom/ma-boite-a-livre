import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token et mot de passe requis." });
  }

  try {
    const db = await getDb();
    const user = await db.collection("Users").findOne({ resetToken: token });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "Token invalide ou expiré." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.collection("Users").updateOne(
      { resetToken: token },
      { $set: { passwordHash }, $unset: { resetToken: "", resetTokenExpiry: "" } }
    );

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}