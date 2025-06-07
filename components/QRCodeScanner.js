// components/QRCodeScanner.js
import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QRCodeScanner({ onScan, active = true }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!scannerRef.current) {
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
    }

    if (active) {
      scannerRef.current.start();
    } else {
      scannerRef.current.stop();
    }

    return () => {
      scannerRef.current?.stop();
    };
  }, [onScan, active]);

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }} />
    </div>
  );
}
