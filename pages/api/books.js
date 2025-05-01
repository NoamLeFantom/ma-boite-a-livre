import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const secretKey = process.env.API_SECRET_KEY;
  const clientKey = req.headers["books-travelling"];

  if (!clientKey || clientKey !== secretKey) {
    return res.status(403).json({ error: "Forbidden: Invalid or missing header" });
  }

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
    const { title, author, isbn, history, comments, literaryMovement } = req.body;

    if (!title || !author || !isbn) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const existingBooks = await db.collection("BookData").find({ isbn }).toArray();
      const count = existingBooks.length;
      const id = `${isbn}-${String(count + 1).padStart(4, '0')}`;

      const result = await db.collection("BookData").insertOne({
        id,
        title,
        author,
        isbn,
        history: history || [],
        comments: comments || "",
        literaryMovement: literaryMovement || "",
      });

      res.status(201).json({
        _id: result.insertedId,
        id,
        title,
        author,
        isbn,
        history,
        comments,
        literaryMovement,
      });
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