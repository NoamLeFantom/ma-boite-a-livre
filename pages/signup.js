import { useState } from "react";
import { useRouter } from "next/router";
import { setCurrentUser } from "@/lib/session";
import Header from "@/components/Header";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sign up");
      }

      const user = await response.json();
      if (!user) {
        alert("Pseudo déjà pris");
        return;
      }
      setCurrentUser(user);

      await fetch("/api/send-validation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      alert("Inscription réussie ! Un email de validation a été envoyé.");
      router.push("/email-wasSend");
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
          <h1 style={{ marginBottom: 24 }}>Créer un compte</h1>
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
            <button type="submit">S'inscrire</button>
          </form>
          <p style={{ marginTop: 16 }}>
            Déjà inscrit ? <a href="/login" style={{ color: "var(--primary)" }}>Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  );
}