import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Username, password, and email are required" });
  }

  console.log("Received request body:", req.body);

  try {
    const db = await getDb();
    if (!db) {
      console.error("Failed to connect to database");
      return res.status(500).json({ error: "Database connection failed" });
    }
    console.log("Connected to database");

    const existingUser = await db.collection("Users").findOne({ username });
    console.log("Checked for existing user:", existingUser);

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const result = await db.collection("Users").insertOne({
      username,
      passwordHash: hashedPassword,
      email,
      role: "user",
      createdAt: new Date(),
    });

    if (!result.acknowledged) {
      console.error("Failed to insert user into database");
      return res.status(500).json({ error: "Failed to create user" });
    }

    console.log("User inserted successfully");
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signup API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}