import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import { setCurrentUser } from "@/lib/session";


import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
        headers: { "Content-Type": "application/json" },
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
        setCurrentUser(user);
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
    <div>
      <Header />
      <div className="GlobalPage">
        <div
          style={{
            maxWidth: 400,
            margin: "40px auto",
            background: "var(--glass-bg)",
            boxShadow: "var(--glass-shadow)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1.5px solid var(--glass-border)",
            borderRadius: "18px",
            padding: "32px 24px"
          }}
        >
          <h1 style={{ marginBottom: 24 }}>Connexion</h1>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: "1rem",
                background: "rgba(255,255,255,0.5)",
                color: "var(--foreground)"
              }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                border: "1px solid var(--glass-border)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: "1rem",
                background: "rgba(255,255,255,0.5)",
                color: "var(--foreground)"
              }}
            />
            <button type="submit">Se connecter</button>
          </form>
          <p style={{ marginTop: 12 }}>
            <a href="/forgot-password" style={{ color: "var(--primary)" }}>Mot de passe oublié ?</a>
          </p>
          {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
          <p style={{ marginTop: 16 }}>
            Pas encore de compte ? <a href="/signup" style={{ color: "var(--primary)" }}>Créer un compte</a>
          </p>
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
