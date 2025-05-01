export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stored = req.cookies.user;
  if (!stored) {
    return res.status(200).json({ user: null });
  }

  try {
    const user = JSON.parse(stored);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    res.status(500).json({ error: "Failed to parse user data" });
  }
}