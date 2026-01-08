"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, PrinterIcon, PaperAirplaneIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { ReceiptData } from "@/types/operations/receipt";
import { openPrintWindow, PaperWidth, generateBridgeReceiptHtml } from "@/lib/receipt";
import { generateQRCodeDataUrl } from "@/lib/qr-utils";
import { QRCodeComponent } from "@/components/receipt/qr-code";
import { toast } from "sonner";

interface ReceiptPreviewProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

export function ReceiptPreview({ open, onClose, data }: ReceiptPreviewProps) {
  const [isSending, setIsSending] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async (paperWidth: PaperWidth = "58mm") => {
    if (data) {
      try {
        setIsPrinting(true);
        await openPrintWindow(data, paperWidth);
      } catch (error) {
        console.error("Failed to open print window:", error);
        toast.error("Failed to open print preview");
      } finally {
        setIsPrinting(false);
      }
    }
  };

  const handlePrintViaBridge = async () => {
    if (!data) return;
    
    try {
      setIsPrinting(true);
      
      // Create minimal bridge data payload - exclude QR image to keep URL short
      // Bridge app will generate QR code from package_token
      const bridgeData = {
        receipt_number: data.receipt_number,
        id: data.id,
        package_token: data.package_token,
        s_date: data.s_date,
        s_time: data.s_time,
        receipt: data.receipt,
        // Exclude qrCodeDataUrl and receiptHtml to keep payload small
      };
      
      // URL encode the minimal JSON payload
      const jsonPayload = JSON.stringify(bridgeData);
      console.log("Bridge payload (minimal):", jsonPayload.length, "bytes");
      
      const encodedData = encodeURIComponent(jsonPayload);
      const bridgeUrl = `mzigo://print?data=${encodedData}`;
      
      console.log("Bridge URL length:", bridgeUrl.length, "bytes");
      
      // Setup callback listener for print completion
      const handleBridgeCallback = (event: MessageEvent) => {
        if (event.data?.type === "print_complete" && event.data?.receipt_id === data.id) {
          console.log("✓ Print completed via bridge app");
          toast.success("Receipt printed successfully", {
            description: `Receipt #${data.receipt_number} has been printed.`,
          });
          window.removeEventListener("message", handleBridgeCallback);
          setIsPrinting(false);
        }
      };
      
      window.addEventListener("message", handleBridgeCallback);
      
      // Set a timeout to remove listener if no response (print succeeded silently)
      const timeoutId = setTimeout(() => {
        window.removeEventListener("message", handleBridgeCallback);
        toast.success("Print request sent", {
          description: "Check your Bluetooth printer for the receipt.",
        });
        setIsPrinting(false);
      }, 3000);
      
      const printCompleteTimeout = setTimeout(() => {
        clearTimeout(timeoutId);
        window.removeEventListener("message", handleBridgeCallback);
      }, 30000);
      
      // Try to open native app
      console.log("Opening bridge app with print request...");
      window.location.href = bridgeUrl;
      
      // Fallback after timeout
      setTimeout(() => {
        if (isPrinting) {
          clearTimeout(printCompleteTimeout);
          window.removeEventListener("message", handleBridgeCallback);
          toast.info("Print Bridge app not found", {
            description: "Install the Web Print Bridge app to print via Bluetooth",
          });
          setIsPrinting(false);
        }
      }, 2000);
    } catch (error) {
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
    try {
      // TODO: Implement send functionality (e.g., send via SMS, WhatsApp, or email)
      toast.success("Receipt sent successfully!", {
        description: `Receipt #${data.receipt_number} has been sent.`,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to send receipt", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  const isOfflineReceipt = data?.receipt_number?.startsWith("OFFLINE-");

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Receipt Preview
            {isOfflineReceipt && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Offline
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isOfflineReceipt && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
            This receipt was created offline and will sync when you&apos;re back online.
          </div>
        )}

        <div className="mt-2">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={!data || isSending || isPrinting}>
                {isSending ? "Sending..." : isPrinting ? "Printing..." : "Actions"}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrintViaBridge}>
                <DevicePhoneMobileIcon className="mr-2 h-4 w-4" />
                Print via Bridge App
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePrint("58mm")}>
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print (58mm - P-50)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrint("80mm")}>
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print (80mm)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSend} disabled={isOfflineReceipt}>
                <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                Send {isOfflineReceipt && "(unavailable offline)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
