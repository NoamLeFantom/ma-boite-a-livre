import QRCodeScanner from "@/components/QRCodeScanner";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/session";

export async function getServerSideProps(context) {
  const user = getCurrentUser(context.req);
  return {
    props: {
      initialUser: user || null,
    },
  };
}

export default function ScanPage({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!initialUser) {
      setUser(getCurrentUser());
    }
    setShowPopup(true); // Affiche la popup à chaque arrivée sur la page
  }, [initialUser]);

  const handleScan = (data) => {
    try {
      const id = data.split("/book/")[1];
      if (id) {
        router.push(`/book/${id}`);
      } else {
        alert("QR invalide");
      }
    } catch (err) {
      alert("Erreur de scan");
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className="GlobalPage">
        <p>
          Vérifie bien que le livre possède un QR code qui renvoie vers un URL
          comme "https://ma-boite-a-livre.vercel.app/book"
        </p>
        <h1 className="text-xl font-semibold mb-4">Scanner un QR Code 📖</h1>
        <QRCodeScanner onScan={handleScan} />

        {/* Popup HTML */}
        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--glass-bg)",
              boxShadow: "var(--glass-shadow)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1.5px solid var(--glass-border)",
              color: "var(--foreground)",
              padding: "24px 32px",
              zIndex: 1000,
              borderRadius: "16px",
              textAlign: "center",
              minWidth: "280px",
              maxWidth: "90vw",
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Information</h2>
            {user ? (
              <p>
                Vous êtes connecté en tant que <strong>{user.username}</strong>.
              </p>
            ) : (
              <p>
                Vous n'êtes pas connecté. Certaines fonctionnalités pourraient ne pas être disponibles.
              </p>
            )}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              {!user && (
                <button onClick={() => router.push("/login")}>Se connecter</button>
              )}
              <button
                style={{ backgroundColor: "gray" }}
                onClick={() => setShowPopup(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}