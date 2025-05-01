import { getDb } from "@/lib/mongodb";
import { parse } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, action, location, pseudo: providedPseudo } = req.body;
  let pseudo = providedPseudo;

  if (!id || !action || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!pseudo) {
    const cookies = parse(req.headers.cookie || "");
    const userCookie = cookies.user;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        pseudo = user.username;
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }

  try {
    const db = await getDb();
    const result = await db.collection("BookData").updateOne(
      { id },
      {
        $push: {
          history: {
            action,
            location,
            pseudo,
            date: new Date().toISOString().split("T")[0],
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Interaction added successfully" });
  } catch (error) {
    console.error("Error adding interaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}