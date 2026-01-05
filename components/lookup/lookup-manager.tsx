"use client";

import { useEffect, useState } from "react";
import { QRScanner } from "./qr-scanner";
import { LookupReceiptPreview } from "./lookup-receipt-preview";
import type { ReceiptData } from "@/types/operations/receipt";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useReceiptLookup } from "@/hooks";

export function LookupManager() {
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  const { data, error, isLoading } = useReceiptLookup(activeToken);

  const handleScan = (decodedToken: string) => {
    setShowScanner(false);
    setActiveToken(decodedToken);
  };

  useEffect(() => {
    if (error) {
      toast.error("Failed to look up receipt", {
        description: error.message,
      });
      setShowScanner(true);
      setActiveToken(null);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setReceiptData(data);
      setShowPreview(true);
      toast.success("Receipt found!");
    } else if (activeToken && !isLoading && data === null) {
      // Explicit "not found" case
      toast.error("Receipt not found", {
        description: "No receipt found for the scanned QR code.",
      });
      setShowScanner(true);
      setActiveToken(null);
    }
  }, [data, isLoading, activeToken]);

  const handleClosePreview = () => {
    setShowPreview(false);
    setReceiptData(null);
    setShowScanner(true);
    setActiveToken(null);
  };

  const handleScanError = (error: string) => {
    toast.error("Scanner error", {
      description: error,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-muted-foreground">Looking up receipt...</p>
          </div>
        )}

        {!isLoading && showScanner && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <QrCodeIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Scan QR Code</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Scan a receipt QR code to view its details
              </p>
            </div>
            <QRScanner onScan={handleScan} onError={handleScanError} />
          </div>
        )}

        {!isLoading && !showScanner && !showPreview && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">Scanner stopped</p>
            <Button onClick={() => setShowScanner(true)}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Scan Again
            </Button>
          </div>
        )}
      </div>

      <LookupReceiptPreview
        open={showPreview}
        onClose={handleClosePreview}
        data={receiptData}
      />
    </div>
  );
}
