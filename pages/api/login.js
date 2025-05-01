import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  console.log("Received login request:", { email, password });

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error("Failed to connect to database");
      return res.status(500).json({ error: "Database connection failed" });
    }
    console.log("Connected to database");

    const user = await db.collection("Users").findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.error("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    const cookie = serialize("user", JSON.stringify({ username: user.username, role: user.role }), cookieOptions);
    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}