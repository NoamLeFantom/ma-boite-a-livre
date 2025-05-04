import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token manquant" });
  }

  try {
    const db = await getDb();
    const user = await db.collection("Users").findOne({ emailToken: token });

    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    await db.collection("Users").updateOne(
      { _id: user._id },
      { $set: { emailVerified: true }, $unset: { emailToken: "" } }
    );

    return res.status(200).json({ message: "Email confirmé avec succès" });
  } catch (err) {
    console.error("Erreur confirmation email :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
