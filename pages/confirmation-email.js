import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/confirmation-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setMessage("Votre adresse email a bien été confirmée !");
        } else {
          setMessage(data.error || "Erreur lors de la confirmation.");
        }
      } catch (err) {
        setMessage("Erreur serveur.");
      }
    };

    verifyEmail();
  }, [token]);

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
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: 24 }}>Confirmation d'email</h1>
          <p>{message}</p>
          <Link href="/login" style={{ color: "var(--primary)" }}>
            Connectez-vous ici
          </Link>
        </div>
      </div>
    </div>
  );
}
