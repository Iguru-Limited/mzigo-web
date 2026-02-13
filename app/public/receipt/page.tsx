"use client";

import { useSearchParams } from "next/navigation";
import { usePublicReceipt } from "@/hooks/public/use-public-receipt";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { downloadReceipt } from "@/lib/receipt";
import { toast } from "sonner";

export default function PublicReceiptPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { receipt, isLoading, error } = usePublicReceipt(token);

  const handleDownload = async () => {
    if (!receipt) return;
    try {
      await downloadReceipt({
        id: receipt.id,
        receipt_number: receipt.receipt_number,
        receipt: receipt.receipt as any,
        s_date: receipt.s_date,
        s_time: receipt.s_time,
        package_token: receipt.package_token,
      });
      toast.success("Receipt downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download receipt");
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive font-semibold">Invalid receipt link</p>
          <p className="text-sm text-muted-foreground">No token provided</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive font-semibold">Failed to load receipt</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground font-semibold">Receipt not found</p>
          <p className="text-sm text-muted-foreground">This receipt may have been deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 overflow-x-hidden">
      <div className="flex justify-center w-full">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center">
            <div>
              <h1 className="text-2xl font-semibold">Receipt #{receipt.receipt_number}</h1>
              <p className="text-sm text-muted-foreground">
                Issued on {new Date(receipt.s_date + "T" + receipt.s_time).toLocaleDateString()}
              </p>
            </div>
            
          </div>

          {/* Receipt Content */}
          <div className="bg-white rounded-lg p-8 shadow-sm border w-fit mx-auto overflow-auto text-left">
            <div className="space-y-0">
              {receipt.receipt.map((line, idx) => {
                const fontSize =
                  line.text_size === "big" ? "24px" : line.text_size === "small" ? "12px" : "15px";
                const fontWeight = line.is_bold ? "bold" : "normal";
                const content = `${line["pre-text"]}${line.content}`;
                return (
                  <div
                    key={idx}
                    className="whitespace-pre font-mono"
                    style={{
                      fontSize,
                      fontWeight,
                      lineHeight: "1.4",
                    }}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button onClick={handleDownload} className="gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
