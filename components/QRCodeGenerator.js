import { useRef } from "react";
import * as htmlToImage from "html-to-image";
import QRCode from "react-qr-code";

function QRCodeGenerator({ url, visible }) {
  const qrCodeRef = useRef(null);

  const downloadQRCode = () => {
    htmlToImage
      .toPng(qrCodeRef.current)
      .then(function (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "qr-code.png";
        link.click();
      })
      .catch(function (error) {
        console.error("Error generating QR code:", error);
      });
  };

  if (!visible) return null;

  return (
    <div className="qrcode__download">
      <div className="qrcode__image" ref={qrCodeRef}>
        <QRCode value={url} size={180} />
      </div>
      <button onClick={downloadQRCode}>Télécharger le QR Code</button>
    </div>
  );
}

export default QRCodeGenerator;