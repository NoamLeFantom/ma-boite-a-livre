import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    console.log("Attempting to connect to MongoDB...");
    const db = await getDb(); // Utilise directement l'objet retourné par getDb
    console.log("Connected to database");

    console.log("Fetching books from BookData collection...");
    const books = await db.collection("BookData").find({}).toArray();
    console.log("Books fetched successfully:", books);

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}