// pages/scan.js
import QRCodeScanner from "@/components/QRCodeScanner";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import styles from "@/styles/Home.module.css";

export default function ScanPage() {
  const router = useRouter();

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
      <div class="GlobalPage">
        <p>Vérifie bien que le livre posséde un QR code qui renvoie vers un url comme "https://ma-boite-a-livre.vercel.app/book</p>
      <h1 className="text-xl font-semibold mb-4">Scanner un QR Code 📖</h1>
      <QRCodeScanner onScan={handleScan} />
    </div>
    </div>
  );
}
