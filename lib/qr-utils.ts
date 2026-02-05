import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL
 */
export function generateQRCodeDataUrl(
  value: string,
  size: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error("QR code generation timed out"));
    }, 5000);
    
    try {
      QRCode.toDataURL(
        value,
        {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
          type: "image/png",
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error, dataUrl) => {
          clearTimeout(timeout);
          if (error) {
            console.error("Failed to generate QR code:", error);
            reject(error);
          } else {
            resolve(dataUrl as string);
          }
        }
      );
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}
