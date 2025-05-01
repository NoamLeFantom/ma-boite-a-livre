import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { setCurrentUser } from "@/lib/session";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Books-Travelling": process.env.NEXT_PUBLIC_API_SECRET_KEY,
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de la connexion");
      }

      // On lit les cookies pour récupérer les infos de l'utilisateur
      const userCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("user="));

      if (userCookie) {
        const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
        setCurrentUser(user); // optionnel, selon ton système de session
        if (user.role === "admin") {
          alert("Bienvenue Admin !");
        }
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Header />
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
