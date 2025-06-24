import { useState } from "react";
import Header from "@/components/Header";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    } else {
      setMessage(data.error || "Une erreur est survenue.");
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
          <h1 style={{ marginBottom: 24 }}>Réinitialisation du mot de passe</h1>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="email"
              placeholder="Entrez votre adresse e-mail"
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
            <button type="submit">Envoyer</button>
          </form>
          {message && <p style={{ marginTop: 16 }}>{message}</p>}
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}