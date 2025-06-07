import Link from "next/link";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";

export default function ConfirmEmailPage() {
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
          <h1 style={{ marginBottom: 24 }}>Email envoyé</h1>
          <p>
            Un email de confirmation vient de vous être envoyé.
            <br /> Merci de vérifier votre boîte de réception.
          </p>
          <Link href="/login" style={{ color: "var(--primary)" }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
