"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { QRScanner } from "./qr-scanner";
import { LookupReceiptPreview } from "./lookup-receipt-preview";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface LookupResponse {
  status: string;
  count: number;
  data: Array<{
    id: string;
    receipt_number: string;
    receipt_2?: string;
    s_date: string;
    s_time: string;
    receipt: ReceiptItem[];
    package_token: string;
  }>;
}

export function LookupManager() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  const handleScan = async (decodedToken: string) => {
    if (!session?.user) {
      toast.error("Not authenticated");
      return;
    }

    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      toast.error("Access token not available");
      return;
    }

    setIsLoading(true);
    setShowScanner(false);

    try {
      const apiUrl = getApiUrl(API_ENDPOINTS.QR_LOOKUP);
      const urlWithParam = `${apiUrl}?package_token=${encodeURIComponent(decodedToken)}`;

      const response = await fetch(urlWithParam, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result: LookupResponse = await response.json();

      if (result.status !== "success" || result.count === 0 || !result.data?.length) {
        toast.error("Receipt not found", {
          description: "No receipt found for the scanned QR code.",
        });
        setShowScanner(true);
        return;
      }

      // Take the first receipt from the response
      const receiptInfo = result.data[0];
      
      // Map to ReceiptData format
      const mappedData: ReceiptData = {
        id: receiptInfo.id,
        receipt_number: receiptInfo.receipt_number,
        package_token: receiptInfo.package_token,
        s_date: receiptInfo.s_date,
        s_time: receiptInfo.s_time,
        receipt: receiptInfo.receipt,
      };

      setReceiptData(mappedData);
      setShowPreview(true);
      toast.success("Receipt found!");
    } catch (error) {
      console.error("Lookup error:", error);
      toast.error("Failed to look up receipt", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
      setShowScanner(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setReceiptData(null);
    setShowScanner(true);
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
