"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PreviewDialog, type PreviewAction } from "@/components/ui/preview-dialog";
import { ChevronDownIcon, PrinterIcon, PaperAirplaneIcon, DevicePhoneMobileIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ReceiptData } from "@/types/operations/receipt";
import { openPrintWindow, PaperWidth, downloadReceipt } from "@/lib/receipt";
import { QRCodeComponent } from "@/components/receipt/qr-code";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ReceiptPreviewProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export function ReceiptPreview({ open, onClose, data }: ReceiptPreviewProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: session } = useSession();
  const copyCount = Math.max(1, Number(session?.user?.counter ?? 1));

  const handleDownload = async () => {
    if (!data) return;

    setIsDownloading(true);

    try {
      await downloadReceipt(data);
      toast.success("Receipt downloaded successfully!", {
        description: `Receipt #${data.receipt_number} has been downloaded.`,
      });
      // Redirect to homepage after successful download
      onClose();
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async (paperWidth: PaperWidth = "58mm") => {
    if (!data) return;
    
    setIsPrinting(true);
    
    // Safety timeout to reset state if something goes wrong
    const safetyTimeout = setTimeout(() => {
      console.warn("Print operation timed out, resetting state");
      setIsPrinting(false);
    }, 10000); // 10 second max
    
    try {
      await openPrintWindow(data, paperWidth, copyCount);
      // Give print dialog time to appear before resetting state
      setTimeout(() => {
        clearTimeout(safetyTimeout);
        setIsPrinting(false);
      }, 1000);
    } catch (error) {
      clearTimeout(safetyTimeout);
      console.error("Failed to open print window:", error);
      toast.error("Failed to open print preview", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      setIsPrinting(false);
    }
  };

  const handlePrintViaBridge = async () => {
    if (!data) return;
    
    setIsPrinting(true);
    
    // Safety timeout to prevent hanging
    const safetyTimeout = setTimeout(() => {
      console.warn("Bridge print timed out, resetting state");
      setIsPrinting(false);
    }, 5000);
    
    try {
      // Create minimal bridge data payload - exclude QR code and package token
      const bridgeData = {
        receipt_number: data.receipt_number,
        id: data.id,
        s_date: data.s_date,
        s_time: data.s_time,
        receipt: data.receipt,
        copies: copyCount,
      };
      
      const jsonPayload = JSON.stringify(bridgeData);
      console.log("Bridge payload (minimal):", jsonPayload.length, "bytes");
      
      const encodedData = encodeURIComponent(jsonPayload);
      const bridgeUrl = `mzigo://print?data=${encodedData}`;
      
      console.log("Bridge URL length:", bridgeUrl.length, "bytes");
      console.log("Opening bridge app with print request copies:", copyCount);
      
      // Try to open native app without blocking
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = bridgeUrl;
      document.body.appendChild(iframe);
      
      // Clean up iframe after a moment
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
      
      // Show success message immediately
      clearTimeout(safetyTimeout);
      toast.success("Print request sent", {
        description: "Check your Bluetooth printer for the receipt.",
      });
      setIsPrinting(false);
      
    } catch (error) {
      clearTimeout(safetyTimeout);
      console.error("✗ Failed to prepare bridge print:", error);
      toast.error("Failed to prepare print", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
      setIsPrinting(false);
    }
  };

  const handleSend = async () => {
    if (!data) return;
    
    setIsSending(true);
    
    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      console.warn("Send operation timed out");
      setIsSending(false);
    }, 5000);
    
    try {
      // TODO: Implement send functionality (e.g., send via SMS, WhatsApp, or email)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async
      clearTimeout(safetyTimeout);
      toast.success("Receipt sent successfully!", {
        description: `Receipt #${data.receipt_number} has been sent.`,
      });
      setIsSending(false);
      onClose();
    } catch (error) {
      clearTimeout(safetyTimeout);
      toast.error("Failed to send receipt", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
      setIsSending(false);
    }
  };

  const isOfflineReceipt = data?.receipt_number?.startsWith("OFFLINE-");

  const actions: PreviewAction[] = data
    ? [
        {
          label: "Print via Bridge App",
          icon: <DevicePhoneMobileIcon className="w-4 h-4" />,
          onClick: handlePrintViaBridge,
          disabled: isPrinting,
          separator: true,
        },
        {
          label: "Print (58mm - P-50)",
          icon: <PrinterIcon className="w-4 h-4" />,
          onClick: () => handlePrint("58mm"),
          disabled: isPrinting,
        },
        {
          label: "Print (80mm)",
          icon: <PrinterIcon className="w-4 h-4" />,
          onClick: () => handlePrint("80mm"),
          disabled: isPrinting,
          separator: true,
        },
        {
          label: "Download Receipt",
          icon: <ArrowDownTrayIcon className="w-4 h-4" />,
          onClick: handleDownload,
          disabled: isDownloading,
          separator: true,
        },
        {
          label: `Send ${isOfflineReceipt ? "(unavailable offline)" : ""}`,
          icon: <PaperAirplaneIcon className="w-4 h-4" />,
          onClick: handleSend,
          disabled: isSending || isOfflineReceipt,
        },
      ]
    : [];

  return (
    <PreviewDialog
      open={open}
      onClose={onClose}
      title="Receipt Preview"
      maxWidth="md"
      actions={actions}
    >
      {isOfflineReceipt && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm mb-4 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Offline
          </span>
          This receipt was created offline and will sync when you&apos;re back online.
        </div>
      )}

      {!data && <p className="text-sm text-muted-foreground">No receipt data.</p>}
      {data && (
        <div className="rounded border p-3 bg-white max-h-[60vh] overflow-auto font-mono text-sm leading-6">
          {/* Render receipt lines simply for preview */}
          {data.receipt.map((item, idx) => (
            <div key={idx} className={item.is_bold ? "font-bold" : ""}>
              <span className={item.text_size === "big" ? "text-lg" : item.text_size === "normal" ? "text-sm" : "text-xs"}>
                {(item["pre-text"] || "") + (item.content || "")}
              </span>
            </div>
          ))}

          {/* QR Code for package token (online only) */}
          {data.package_token && !isOfflineReceipt && (
            <div className="mt-4 border-t border-dashed pt-4 flex flex-col items-center">
              <QRCodeComponent value={data.package_token} size={150} />
            </div>
          )}
        </div>
      )}
    </PreviewDialog>
  );
}
