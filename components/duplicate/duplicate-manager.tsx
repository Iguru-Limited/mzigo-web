"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, PrinterIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useParcels } from "@/hooks/duplicate/use-parcels";
import { usePrintDuplicate } from "@/hooks/duplicate/use-print-duplicate";

export function DuplicateManager() {
  const { items, isLoading, error } = useParcels();
  const { printDuplicate } = usePrintDuplicate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(5);
  const [isPrinting, setIsPrinting] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter parcels based on search query
  const filteredParcels = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (parcel) =>
        parcel.receipt_number.toLowerCase().includes(query) ||
        parcel.sender_name.toLowerCase().includes(query) ||
        parcel.receiver_name.toLowerCase().includes(query) ||
        parcel.parcel_description.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Show only first `displayCount` items
  const displayedParcels = filteredParcels.slice(0, displayCount);
  const hasMore = filteredParcels.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const handleReprintReceipt = async (parcelId: string) => {
    try {
      setIsPrinting(true);
      const response = await printDuplicate({ parcel_id: parseInt(parcelId) });
      setReceiptPreview(response.data);
      setShowPreview(true);
      toast.success("Receipt loaded for preview");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load receipt");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrint = (paperWidth: "58mm" | "80mm") => {
    if (!receiptPreview) return;
    try {
      const printWindow = window.open("", "PRINT", "height=600,width=800");
      if (!printWindow) return;

      const containerWidth = paperWidth === "58mm" ? "58mm" : "80mm";

      const receiptLines = (receiptPreview.receipt || [])
        .map((line: any) => {
          const fontSize =
            line.text_size === "big" ? "16px" : line.text_size === "small" ? "9px" : "11px";
          const fontWeight = line.is_bold ? "bold" : "normal";
          const preText = line["pre-text"] || "";
          const content = `${preText}${line.content || ""}`;
          return `<div style="font-size: ${fontSize}; font-weight: ${fontWeight}; word-break: break-word; white-space: pre-wrap;">${content}</div>`;
        })
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Duplicate Receipt ${receiptPreview.receipt_number || ""}</title>
          <style>
            @page {
              size: ${containerWidth} auto;
              margin: 6mm;
            }
            body {
              font-family: monospace;
              margin: 0;
              display: flex;
              justify-content: center;
              background: #f9fafb;
            }
            .sheet {
              width: ${containerWidth};
              max-width: ${containerWidth};
              padding: 8px;
              box-sizing: border-box;
              background: white;
            }
            .duplicate-badge {
              color: black;
              padding: 6px;
              text-align: center;
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 11px;
            }
            .receipt-content {
              font-family: monospace;
              font-size: ${paperWidth === "58mm" ? "10px" : "12px"};
              line-height: 1.35;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="duplicate-badge"> DUPLICATE RECEIPT </div>
            <div class="receipt-content">
              ${receiptLines}
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.document.title = `Duplicate Receipt ${receiptPreview.receipt_number || ""}`;
      setTimeout(() => printWindow.print(), 250);
    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Failed to print receipt");
    }
  };

  const handlePrintViaBridge = () => {
    if (!receiptPreview) return;
    const encodedData = encodeURIComponent(JSON.stringify(receiptPreview));
    const bridgeUrl = `mzigo://print-duplicate?data=${encodedData}`;
    window.location.href = bridgeUrl;
    setTimeout(() => {
      toast.error("Print Bridge app not found. Please install the MZIGO Bridge app.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Duplicate Receipt</h2>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Waybill or Parcel
            </label>
            <Input
              type="text"
              placeholder="Search by waybill, sender, receiver, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(5); // Reset to first 5 on new search
              }}
            />
          </div>
          {filteredParcels.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Found {filteredParcels.length} parcel{filteredParcels.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </Card>

      <Separator />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" /> Loading parcels…
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error.message}</div>
      ) : filteredParcels.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">📦</div>
            <EmptyTitle>
              {searchQuery ? "No Parcels Found" : "No Parcels Available"}
            </EmptyTitle>
            <EmptyDescription>
              {searchQuery
                ? "Try adjusting your search query"
                : "No parcels to display"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4">
            {displayedParcels.map((parcel) => (
              <Card key={parcel.id} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{parcel.receipt_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.s_date} {parcel.s_time}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {parcel.amount_charged}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {parcel.parcel_description}
                  </p>

                  {/* Sender & Receiver */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium text-muted-foreground">From</p>
                      <p className="font-semibold">{parcel.sender_name}</p>
                      <p className="text-muted-foreground">
                        {parcel.sender_town}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">To</p>
                      <p className="font-semibold">{parcel.receiver_name}</p>
                      <p className="text-muted-foreground">
                        {parcel.receiver_town}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-semibold">{parcel.p_vehicle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-semibold">{parcel.payment_mode}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prints</p>
                      <p className="font-semibold">{parcel.print_times}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReprintReceipt(parcel.id)}
                    disabled={isPrinting}
                    className="w-full"
                  >
                    {isPrinting ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Reprint Receipt"
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More ({displayCount} / {filteredParcels.length})
              </Button>
            </div>
          )}
        </>
      )}

      {/* Duplicate Receipt Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="space-y-2">
              <div className=" rounded px-3 py-2 text-center">
                <p className="text-sm font-bold"> DUPLICATE RECEIPT </p>
              </div>
              <DialogTitle>Receipt Preview</DialogTitle>
              <p className="text-sm text-muted-foreground">Waybill: {receiptPreview?.receipt_number}</p>
            </div>
          </DialogHeader>

          {receiptPreview && (
            <div className="rounded border p-3 bg-white max-h-[60vh] overflow-auto font-mono text-sm leading-6 space-y-1">
              <div className="text-center font-bold ">DUPLICATE RECEIPT</div>
              {receiptPreview.receipt?.map((line: any, idx: number) => {
                const fontSize =
                  line.text_size === "big" ? "text-lg" : line.text_size === "small" ? "text-xs" : "text-sm";
                const fontWeight = line.is_bold ? "font-bold" : "font-normal";
                const preText = line["pre-text"] || "";
                const content = line.content || "";
                return (
                  <div key={idx} className={`${fontSize} ${fontWeight}`}>
                    {preText}
                    {content}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Actions
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePrintViaBridge()}>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
