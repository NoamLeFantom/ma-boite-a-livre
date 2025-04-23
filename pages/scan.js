// pages/scan.js
import QRCodeScanner from "@/components/QRCodeScanner";
import { useRouter } from "next/router";
import Header from "@/components/Header";


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
    <div className="p-4">
      <Header/>
      <h1 className="text-xl font-semibold mb-4">Scanner un QR Code 📖</h1>
      <QRCodeScanner onScan={handleScan} />
    </div>
  );
}
