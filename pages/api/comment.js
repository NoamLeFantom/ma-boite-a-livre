import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, pseudo, message } = req.body;

  if (!id || !pseudo || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = await getDb();
    const result = await db.collection("BookData").updateOne(
      { id },
      {
        $push: {
          comments: {
            pseudo,
            message,
            date: new Date().toISOString().split("T")[0],
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}