"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeComponentProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
}

export function QRCodeComponent({
  value,
  size = 200,
  level = "M",
  includeMargin = true,
}: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: includeMargin ? 2 : 0,
          errorCorrectionLevel: level,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("Failed to generate QR code:", error);
          }
        }
      );
    }
  }, [value, size, level, includeMargin]);

  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} />;
}
