import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === "GET") {
    try {
      const books = await db.collection("BookData").find({}).toArray();
      res.status(200).json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  } else if (req.method === "POST") {
    const { title, author, isbn } = req.body;

    if (!title || !author || !isbn) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await db.collection("BookData").insertOne({ title, author, isbn });
      res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error("Error adding book:", error);
      res.status(500).json({ error: "Failed to add book" });
    }
  } else if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing book ID" });
    }

    try {
      const result = await db.collection("BookData").deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}