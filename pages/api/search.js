import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;
  console.log("Received query:", query);

  try {
    const db = await getDb();
    console.log("Connected to database");

    if (!query) {
      console.error("Query parameter is missing");
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const books = await db
      .collection("BookData")
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
          { isbn: { $regex: query, $options: "i" } },
        ],
      })
      .toArray();

    console.log("Books fetched:", books);
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
}