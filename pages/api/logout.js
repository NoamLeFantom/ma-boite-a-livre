import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookie = serialize("user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: -1, // Expire immediately
  });

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ message: "Logout successful" });
}