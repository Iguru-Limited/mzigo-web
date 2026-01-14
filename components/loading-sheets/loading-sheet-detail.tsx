"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, FileText, MapPin, User, Truck, Calendar, Package, Printer, Eye, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoadingSheetDetailProps {
  sheet: any;
}

export function LoadingSheetDetail({ sheet }: LoadingSheetDetailProps) {
  const router = useRouter();
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printSize, setPrintSize] = useState<"58mm" | "80mm">("58mm");
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async (size: "58mm" | "80mm") => {
    try {
      setIsPrinting(true);
      setPrintSize(size);
      setTimeout(() => {
        if (printRef.current) {
          const printWindow = window.open("", "PRINT", "height=600,width=800");
          if (printWindow) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Loading Sheet ${sheet?.sheet_number}</title>
                <style>
                  body { margin: 0; padding: 10px; font-family: monospace; }
                  .container { width: ${size === "58mm" ? "58mm" : "80mm"}; margin: 0 auto; }
                </style>
              </head>
              <body>
                ${printRef.current?.innerHTML}
              </body>
              </html>
            `);
            printWindow.document.close();
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              printWindow.close();
            }, 250);
          }
        }
      }, 100);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintViaBridge = () => {
    if (!sheet) return;
    const encodedData = encodeURIComponent(JSON.stringify({
      sheet_number: sheet.sheet_number,
      destination: sheet.destination_name,
      loader: sheet.loader_name,
      vehicle: sheet.vehicle,
      loading_date: sheet.loading_date,
      parcel_count: sheet.parcel_count,
      parcels: sheet.parcels
    }));
    const bridgeUrl = `mzigo://print-loading-sheet?data=${encodedData}`;
    window.location.href = bridgeUrl;
    setTimeout(() => {
      alert("Print Bridge app not found. Please install the MZIGO Bridge app to use this feature.");
    }, 2000);
  };

  return (
    <div className="flex flex-1 flex-col gap-3 md:gap-6 w-full">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="w-fit -ml-2 h-auto px-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Header Card */}
      <Card className="border-border/70 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-bold truncate">{sheet.sheet_number}</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Loading Sheet Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${
                  sheet.dispatch_status === "undispatched"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current flex-shrink-0"></span>
                <span className="hidden sm:inline">{sheet.dispatch_status === "undispatched" ? "Undispatched" : "Dispatched"}</span>
                <span className="sm:hidden">{sheet.dispatch_status === "undispatched" ? "Pending" : "Done"}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
            <Button
              variant="default"
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Preview & Print</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sheet Information Card */}
      <Card className="border-border/70 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>Sheet Information</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Destination</p>
                <p className="font-medium text-sm md:text-base break-words">{sheet.destination_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Loader</p>
                <p className="font-medium text-sm md:text-base break-words">{sheet.loader_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium text-sm md:text-base">{sheet.vehicle || "Not assigned"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Loading Date</p>
                <p className="font-medium text-sm md:text-base">{sheet.loading_date || "Not loaded"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Created At</p>
                <p className="font-medium text-sm md:text-base">{sheet.created_at}</p>
              </div>
            </div>
            {sheet.dispatch_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Dispatch Date</p>
                  <p className="font-medium text-sm md:text-base">{sheet.dispatch_date}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parcels Card */}
      <Card className="border-border/70 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>Parcels ({sheet.parcel_count})</span>
          </h2>
          <div className="space-y-2 md:space-y-3">
            {sheet.parcels.map((parcel: any) => (
              <Card key={parcel.id} className="border-border/50 bg-gradient-to-br from-white to-slate-50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-xs md:text-sm text-primary">{parcel.receipt_number}</h3>
                  </div>
                  <div className="space-y-1 text-xs md:text-sm">
                    <p className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-fit">Sender:</span>
                      <span className="font-medium break-words">{parcel.sender_name}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-fit">Receiver:</span>
                      <span className="break-words">
                        <span className="font-medium">{parcel.receiver_name}</span>
                        <span className="text-muted-foreground"> ({parcel.receiver_phone})</span>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-muted-foreground min-w-fit">Desc:</span>
                      <span className="break-words">{parcel.parcel_description}</span>
                    </p>
                    <p className="flex items-start gap-2 pt-1 border-t border-border/30">
                      <span className="text-muted-foreground min-w-fit">Amount:</span>
                      <span className="font-semibold text-green-600">KSh {parcel.amount_charged}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {sheet.parcels.length === 0 && (
            <Card className="border-border/50 bg-slate-50">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No parcels in this loading sheet</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-3 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-base md:text-xl">Loading Sheet Preview</DialogTitle>
          </DialogHeader>
          {sheet && (
            <div className={`flex justify-center items-start p-2 md:p-4 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-border/30 ${printSize === "58mm" ? "w-[58mm] mx-auto" : "w-[80mm] mx-auto"}`}>
              <PrintableLoadingSheet sheet={sheet} paperSize={printSize} />
            </div>
          )}
          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPrintPreview(false)} className="flex-1 sm:flex-auto">
              Close
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!sheet || isPrinting} className="flex-1 sm:flex-auto flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span>{isPrinting ? "Printing..." : "Print"}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={handlePrintViaBridge} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Print via Bridge App</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlePrint("80mm")} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>58mm Thermal Printer</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePrint("80mm")} className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>80mm Thermal Printer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden printable content */}
      <div className="hidden print:block">
        <div ref={printRef}>
          <PrintableLoadingSheet sheet={sheet} paperSize={printSize} />
        </div>
      </div>
    </div>
  );
}

function PrintableLoadingSheet({ sheet, paperSize = "58mm" }: { sheet: any; paperSize: "58mm" | "80mm" }) {
  const is58mm = paperSize === "58mm";
  const containerWidth = is58mm ? "58mm" : "80mm";
  
  return (
    <div className="text-black font-mono" style={{ width: containerWidth }}>
      {/* Header */}
      <div className="text-center mb-2 border-b-2 border-black pb-1 text-sm">
        <h1 className="font-bold mb-0.5 text-base">LOADING SHEET</h1>
        <p className="font-semibold text-sm">{sheet.sheet_number}</p>
      </div>

      {/* Sheet Details */}
      <div className="mb-2 space-y-0.5 text-sm">
        <div className="flex justify-between">
          <span className="font-bold">DEST:</span>
          <span className="text-right flex-1 ml-1 truncate">{sheet.destination_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">LOADER:</span>
          <span className="text-right flex-1 ml-1 truncate">{sheet.loader_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">VEHICLE:</span>
          <span className="text-right flex-1 ml-1">{sheet.vehicle || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">STATUS:</span>
          <span className="text-right flex-1 ml-1 font-semibold">
            {sheet.dispatch_status === "undispatched" ? "UNDISPATCHED" : "DISPATCHED"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">DATE:</span>
          <span className="text-right flex-1 ml-1">{sheet.loading_date}</span>
        </div>
        <div className="flex justify-between border-t-2 border-black pt-0.5 mt-0.5">
          <span className="font-bold">PARCELS:</span>
          <span className="text-right font-bold">{sheet.parcel_count}</span>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="mt-2">
        <div className="border-t-2 border-b border-black">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black">
                <th className="text-left py-0.5 px-0.5 font-bold w-8">#</th>
                <th className="text-left py-0.5 px-0.5 font-bold flex-1">RECEIPT</th>
                <th className="text-left py-0.5 px-0.5 font-bold flex-1">SENDER</th>
                <th className="text-left py-0.5 px-0.5 font-bold flex-1">RECEIVER</th>
              </tr>
            </thead>
            <tbody>
              {sheet.parcels.slice(0, is58mm ? 10 : 15).map((parcel: any, index: number) => (
                <tr key={parcel.id} className="border-b border-gray-300">
                  <td className="py-0.5 px-0.5 text-center w-8">{index + 1}</td>
                  <td className="py-0.5 px-0.5 font-medium truncate">{parcel.receipt_number}</td>
                  <td className="py-0.5 px-0.5 truncate text-xs">{parcel.sender_name}</td>
                  <td className="py-0.5 px-0.5 truncate text-xs">{parcel.receiver_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sheet.parcels.length > (is58mm ? 10 : 15) && (
          <div className="text-center border-b-2 border-black py-0.5 text-sm">
            +{sheet.parcels.length - (is58mm ? 10 : 15)} more items
          </div>
        )}
      </div>

      {/* Total Amount */}
      <div className="border-t-2 border-black mt-1 pt-1 text-center font-bold text-sm">
        <div>TOTAL: KSh {sheet.parcels.reduce((sum: number, p: any) => sum + parseFloat(p.amount_charged), 0).toFixed(2)}</div>
      </div>

      {/* Footer */}
      <div className="mt-2 border-t border-gray-400 pt-1 text-center text-sm">
        <p className="font-bold">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Print Date */}
      <div className="mt-2 text-center text-xs text-gray-600">
        <p>Printed: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
