import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  console.log("Received login request:", { username, password });

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const db = await getDb();
    const user = await db.collection("Users").findOne({ username });

    console.log("User found:", user);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    console.log("Setting cookie with options:", cookieOptions);

    const cookie = serialize("user", JSON.stringify({ username }), cookieOptions);

    console.log("Login successful, setting cookie for user:", username);

    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}