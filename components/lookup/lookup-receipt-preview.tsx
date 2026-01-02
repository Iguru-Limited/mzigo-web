"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReceiptData } from "@/types/receipt";
import { QRCodeComponent } from "@/components/receipt/qr-code";

interface LookupReceiptPreviewProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}

/**
 * Read-only receipt preview for lookup results.
 * No print/send actions - just view and close.
 */
export function LookupReceiptPreview({ open, onClose, data }: LookupReceiptPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {!data && <p className="text-sm text-muted-foreground">No receipt data.</p>}
          {data && (
            <div className="rounded border p-3 bg-white max-h-[60vh] overflow-auto font-mono text-sm leading-6">
              {/* Render receipt lines */}
              {data.receipt.map((item, idx) => (
                <div key={idx} className={item.is_bold ? "font-bold" : ""}>
                  <span className={item.text_size === "big" ? "text-lg" : item.text_size === "normal" ? "text-sm" : "text-xs"}>
                    {(item["pre-text"] || "") + (item.content || "")}
                  </span>
                </div>
              ))}
              
              {/* QR Code for package token */}
              {data.package_token && (
                <div className="mt-4 border-t border-dashed pt-4 flex flex-col items-center">
                  <QRCodeComponent value={data.package_token} size={150} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
