import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import styles from "@/styles/Home.module.css";

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
    <div className={styles.container}>
      <Header />
      <h1>Confirmation d'email</h1>
      <p>{message}</p>
      <Link href="/login">Connectez-vous ici</Link>
    </div>
  );
}
