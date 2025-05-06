import { getDb } from "@/lib/mongodb";
import { parse } from "cookie";

export default async function handler(req, res) {
  const db = await getDb();
  const cookies = parse(req.headers.cookie || "");
  const userCookie = cookies.user;

  if (!userCookie) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  let currentUser;
  try {
    currentUser = JSON.parse(decodeURIComponent(userCookie));
  } catch (err) {
    return res.status(400).json({ error: "Cookie utilisateur invalide" });
  }

  const users = db.collection("Users");

  switch (req.method) {
    case "GET":
      const user = await users.findOne({ email: currentUser.email });
      if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

      return res.status(200).json({ user });

    case "PUT":
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Nom et email requis" });
      }

      await users.updateOne(
        { email: currentUser.email },
        { $set: { username: name, email } }
      );

      return res.status(200).json({ message: "Profil mis à jour" });

    case "DELETE":
      await users.deleteOne({ email: currentUser.email });

      res.setHeader("Set-Cookie", "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
      return res.status(200).json({ message: "Compte supprimé" });

    default:
      return res.status(405).json({ error: "Méthode non autorisée" });
  }
}
