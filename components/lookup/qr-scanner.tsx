"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      // Stop the stream immediately - we just needed to request permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error("Camera permission error:", err);
      return false;
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;

    setIsInitializing(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // First request camera permission
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setPermissionDenied(true);
        setError("Camera permission denied. Please allow camera access and try again.");
        onError?.("Camera permission denied");
        setIsInitializing(false);
        return;
      }

      // Clean up any existing scanner
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === Html5QrcodeScannerState.SCANNING) {
            await scannerRef.current.stop();
          }
          const container = document.getElementById("qr-reader");
          if (container) {
            await scannerRef.current.clear();
          }
        } catch {
          // Ignore cleanup errors
        }
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera found on this device");
      }

      // Prefer back camera, fallback to first available
      const backCamera = cameras.find(
        (camera) => camera.label.toLowerCase().includes("back") || 
                    camera.label.toLowerCase().includes("rear") ||
                    camera.label.toLowerCase().includes("environment")
      );
      
      const cameraId = backCamera?.id || cameras[0].id;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Successfully scanned
          void stopScanner();
          onScan(decodedText);
        },
        () => {
          // Scan error (usually just means no QR code found yet)
          // Don't show these errors to user
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Scanner start error:", err);
      let errorMsg = "Failed to start camera";
      
      if (err instanceof Error) {
        if (err.message.includes("Permission") || err.message.includes("NotAllowed")) {
          errorMsg = "Camera permission denied. Please allow camera access in your browser settings.";
          setPermissionDenied(true);
        } else if (err.message.includes("NotFound") || err.message.includes("No camera")) {
          errorMsg = "No camera found on this device.";
        } else if (err.message.includes("NotReadable") || err.message.includes("in use")) {
          errorMsg = "Camera is in use by another application. Please close other apps using the camera.";
        } else if (err.message.includes("secure context") || err.message.includes("HTTPS")) {
          errorMsg = "Camera requires a secure connection (HTTPS).";
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        const container = document.getElementById("qr-reader");
        if (container) {
          await scannerRef.current.clear();
        }
      } catch (err) {
        // Ignore errors when stopping/clearing
        console.warn("QR stop/clear error", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        const cleanup = async () => {
          try {
            const state = scannerRef.current?.getState();
            if (state === Html5QrcodeScannerState.SCANNING) {
              await scannerRef.current?.stop();
            }
            const container = document.getElementById("qr-reader");
            if (container) {
              await scannerRef.current?.clear();
            }
          } catch {
            // Ignore
          }
          scannerRef.current = null;
        };
        void cleanup();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full max-w-[300px] aspect-square bg-muted rounded-lg overflow-hidden"
      />

      {error && (
        <div className="text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {!isScanning ? (
        <Button
          onClick={startScanner}
          disabled={isInitializing}
          className="w-full max-w-[300px]"
        >
          {isInitializing ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Starting Camera...
            </>
          ) : (
            "Start Scanning"
          )}
        </Button>
      ) : (
        <Button
          onClick={stopScanner}
          variant="outline"
          className="w-full max-w-[300px]"
        >
          Stop Scanning
        </Button>
      )}

      {permissionDenied && (
        <p className="text-sm text-muted-foreground text-center">
          To use the scanner, please enable camera access in your browser settings and refresh the page.
        </p>
      )}

      {!permissionDenied && (
        <p className="text-sm text-muted-foreground text-center">
          Point your camera at a QR code to scan
        </p>
      )}
    </div>
  );
}
