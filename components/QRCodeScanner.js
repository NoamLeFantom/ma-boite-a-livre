// components/QRCodeScanner.js
import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QRCodeScanner({ onScan }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          scannerRef.current.stop();
          onScan(result.data);
        },
        {
          returnDetailedScanResult: true,
        }
      );

      scannerRef.current.start();
    }

    return () => {
      scannerRef.current?.stop();
    };
  }, [onScan]);

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }} />
    </div>
  );
}
