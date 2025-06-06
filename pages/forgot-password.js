import { useState } from "react";
import Header from "@/components/Header";

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
    <div style={{ padding: 20 }}>
        <Header />
    <div className="GlobalPage">
      <h1>Réinitialisation du mot de passe</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Entrez votre adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Envoyer</button>
      </form>
      {message && <p>{message}</p>}
    </div>
    </div>
  );
}