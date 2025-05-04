import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";

import { v4 as uuidv4 } from "uuid";
import { sendValidationEmail } from "@/lib/mailer";

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
    const db = await getDb(); // Utilise directement l'objet retourné par getDb
    console.log("Connected to database");

    const existingUser = await db.collection("Users").findOne({ username });
    console.log("Checked for existing user:", existingUser);

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const existingEmail = await db.collection("Users").findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    const emailToken = uuidv4();

    await db.collection("Users").insertOne({
      username,
      passwordHash: hashedPassword,
      email,
      emailToken,
      emailVerified: false,
      role: "user", // Add default role "user"
      createdAt: new Date(),
    });
    console.log("User inserted successfully");

    // Send validation email
    await sendValidationEmail(email, emailToken);
    console.log(`Validation email sent to: ${email}`);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signup API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}