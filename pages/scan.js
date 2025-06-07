import QRCodeScanner from "@/components/QRCodeScanner";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";

export default function ScanPage() {
  const router = useRouter();
  const [user, setUser] = useState(null); // Simule l'utilisateur connecté
  const [showPopup, setShowPopup] = useState(false); // Gère l'affichage de la popup

  useEffect(() => {
    // Simule une vérification de l'utilisateur connecté
    const loggedInUser = null; // Remplacez par votre logique d'authentification
    setUser(loggedInUser);

    if (!loggedInUser) {
      setShowPopup(true); // Affiche la popup si l'utilisateur n'est pas connecté
    }
  }, []);

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
              backgroundColor: "white",
              padding: "20px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h2>Information</h2>
            {user ? (
              <p>
                Vous êtes connecté en tant que <strong>{user.username}</strong>.
              </p>
            ) : (
              <p>Vous n'êtes pas connecté. Certaines fonctionnalités pourraient ne pas être disponibles.</p>
            )}
            <div style={{ marginTop: "15px" }}>
              {!user && (
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  onClick={() => router.push("/login")} // Redirige vers la page de connexion
                >
                  Se connecter
                </button>
              )}
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "gray",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setShowPopup(false)} // Ferme la popup
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