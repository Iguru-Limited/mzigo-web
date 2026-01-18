"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleInput } from "@/components/ui/vehicle-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, PrinterIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { useDeliveries } from "@/hooks/delivery/use-deliveries";
import { useCreateDelivery } from "@/hooks/delivery/use-create-delivery";
import { useSearchMzigo } from "@/hooks/mzigo";
import { useVehicles } from "@/hooks/data/use-vehicles";
import type { DeliveryItem, CreateDeliveryResponse } from "@/types";
import type { SearchMzigoItem } from "@/types/operations/search-mzigo";

type TabType = "delivered" | "undelivered";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): string {
  const newDate = new Date(date.getTime());
  newDate.setDate(newDate.getDate() + days);
  return newDate.toISOString().slice(0, 10);
}

export function DeliveryManager() {
  const [activeTab, setActiveTab] = useState<TabType>("delivered");
  const [startDate, setStartDate] = useState<string>(addDays(new Date(), -7)); // 7 days ago
  const [endDate, setEndDate] = useState<string>(today());
  const [displayCount, setDisplayCount] = useState(10);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptData, setReceiptData] = useState<CreateDeliveryResponse["data"] | null>(null);
  
  // Form state for creating delivery
  const [selectedParcels, setSelectedParcels] = useState<SearchMzigoItem[]>([]);
  const [deliveryVehicle, setDeliveryVehicle] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const { results: searchResults, isLoading: isSearching, error: searchError } = useSearchMzigo(activeQuery);

  // Fetch vehicles for dropdown
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();

  // Fetch deliveries for both tabs
  const {
    deliveries: deliveredDeliveries,
    isLoading: isLoadingDelivered,
    error: errorDelivered,
    refresh: refreshDelivered,
  } = useDeliveries({
    type: "delivered",
    start_date: startDate,
    end_date: endDate,
  });

  const {
    deliveries: undeliveredDeliveries,
    isLoading: isLoadingUndelivered,
    error: errorUndelivered,
    refresh: refreshUndelivered,
  } = useDeliveries({
    type: "undelivered",
    start_date: startDate,
    end_date: endDate,
  });

  const { createDelivery } = useCreateDelivery();

  // Get active deliveries based on tab
  const activeDeliveries =
    activeTab === "delivered" ? deliveredDeliveries : undeliveredDeliveries;
  const isLoading = activeTab === "delivered" ? isLoadingDelivered : isLoadingUndelivered;
  const error = activeTab === "delivered" ? errorDelivered : errorUndelivered;

  // Pagination
  const displayedDeliveries = activeDeliveries.slice(0, displayCount);
  const hasMore = activeDeliveries.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setDisplayCount(10); // Reset pagination when switching tabs
  };

  const handleCreateDelivery = async () => {
    if (selectedParcels.length === 0) {
      toast.error("Please select at least one parcel");
      return;
    }

    if (!deliveryVehicle || !deliveryNotes) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsCreating(true);
      const response: CreateDeliveryResponse = await createDelivery({
        parcel_ids: selectedParcels.map((p) => p.id),
        delivery_vehicle: deliveryVehicle,
        delivery_notes: deliveryNotes,
      });

      // Store receipt data and show preview instead of immediately closing
      setReceiptData(response.data);
      setShowReceiptDialog(true);
      
      // Close create dialog
      setShowCreateDialog(false);
      
      // Reset form
      setSelectedParcels([]);
      setDeliveryVehicle("");
      setDeliveryNotes("");
      setSearchQuery("");
      setActiveQuery(null);
      
      // Refresh data
      refreshDelivered();
      refreshUndelivered();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create delivery";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearchParcels = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  const handleSelectParcel = (parcel: SearchMzigoItem) => {
    const isSelected = selectedParcels.some((p) => p.id === parcel.id);
    if (isSelected) {
      setSelectedParcels((prev) => prev.filter((p) => p.id !== parcel.id));
    } else {
      setSelectedParcels((prev) => [...prev, parcel]);
    }
  };

  const handleRemoveParcel = (parcelId: string) => {
    setSelectedParcels((prev) => prev.filter((p) => p.id !== parcelId));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Manage and track deliveries.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>+ New Delivery</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                refreshDelivered();
                refreshUndelivered();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => handleTabChange("delivered")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "delivered"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Delivered ({deliveredDeliveries.length})
        </button>
        <button
          onClick={() => handleTabChange("undelivered")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "undelivered"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Undelivered ({undeliveredDeliveries.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      ) : displayedDeliveries.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">📦</div>
            <EmptyTitle>
              {activeTab === "delivered" ? "No Delivered Parcels" : "No Undelivered Parcels"}
            </EmptyTitle>
            <EmptyDescription>
              {activeTab === "delivered"
                ? "No parcels have been delivered in this date range."
                : "All parcels have been delivered or there are none pending."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {displayedDeliveries.map((item) => (
            <DeliveryCard key={item.id} item={item} />
          ))}
          {hasMore && (
            <div className="text-center py-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Delivery Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Search Parcels Section */}
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <Label htmlFor="search-parcels">
                Search & Select Parcels <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Search by receipt number, phone number, sender name, or any relevant identifier
              </p>
              <form onSubmit={handleSearchParcels} className="flex gap-2">
                <Input
                  id="search-parcels"
                  placeholder="Enter receipt number, phone, sender name, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="outline" disabled={!searchQuery.trim()}>
                  Search
                </Button>
              </form>

              {/* Search Results */}
              {activeQuery && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {isSearching && (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  )}

                  {searchError && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                      <p className="text-sm text-destructive">Error: {searchError.message}</p>
                    </div>
                  )}

                  {!isSearching && !searchError && searchResults.length === 0 && (
                    <Empty>
                      <EmptyHeader>
                        <div className="text-2xl">🔍</div>
                        <EmptyTitle className="text-base">No Results</EmptyTitle>
                        <EmptyDescription className="text-xs">
                          No parcels found matching &quot;{activeQuery}&quot;
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}

                  {!isSearching && !searchError && searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Found {searchResults.length} parcel{searchResults.length !== 1 ? "s" : ""}
                      </p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {searchResults.map((parcel) => (
                          <ParcelSearchResult
                            key={parcel.id}
                            parcel={parcel}
                            isSelected={selectedParcels.some((p) => p.id === parcel.id)}
                            onSelect={() => handleSelectParcel(parcel)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Parcels */}
            {selectedParcels.length > 0 && (
              <div className="space-y-2 border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                <Label className="text-green-700 dark:text-green-400">
                  Selected Parcels ({selectedParcels.length})
                </Label>
                <div className="space-y-2">
                  {selectedParcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      className="flex items-center justify-between bg-background p-2 rounded border border-green-200 dark:border-green-800"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{parcel.receipt_number}</p>
                        <p className="text-xs text-muted-foreground">{parcel.parcel_description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveParcel(parcel.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="delivery-vehicle">
                Delivery Vehicle <span className="text-destructive">*</span>
              </Label>
              <VehicleInput
                id="delivery-vehicle"
                value={deliveryVehicle}
                onChange={(value) => setDeliveryVehicle(value)}
                vehicles={vehicles}
                isLoading={vehiclesLoading}
                error={vehiclesError}
                placeholder="Select or enter vehicle"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-notes">
                Delivery Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="delivery-notes"
                placeholder="e.g., Received by gatekeeper"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDelivery} disabled={isCreating}>
              {isCreating && <Spinner className="mr-2" />}
              Create Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Receipt Preview Dialog */}
      <DeliveryReceiptPreview
        open={showReceiptDialog}
        data={receiptData}
        onClose={() => {
          setShowReceiptDialog(false);
          setReceiptData(null);
        }}
      />
    </div>
  );
}

interface DeliveryReceiptData {
  delivered_count: number;
  delivered_date: string;
  delivered_time: string;
  parcels: Array<{
    id: string;
    receipt_number: string;
    receiver_phone: string;
  }>;
}

function DeliveryReceiptPreview({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: DeliveryReceiptData | null;
  onClose: () => void;
}) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handleBrowserPrint = async (paperWidth: "58mm" | "80mm" = "58mm") => {
    if (!data) return;

    try {
      setIsPrinting(true);

      // Format the HTML for printing
      const parcelsHtml = data.parcels
        .map(
          (parcel) =>
            `<tr><td style="border: 1px solid #ddd; padding: 8px;">${parcel.receipt_number}</td><td style="border: 1px solid #ddd; padding: 8px;">${parcel.receiver_phone}</td></tr>`
        )
        .join("");

      // Adjust width based on paper size
      const pageWidth = paperWidth === "58mm" ? "58mm" : "80mm";

      const html = `
        <html>
          <head>
            <title>Delivery Receipt</title>
            <style>
              @page {
                size: ${pageWidth} auto;
                margin: 0;
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 5mm;
                width: ${pageWidth};
              }
              .header { text-align: center; margin-bottom: 10px; }
              .header h1 { margin: 0; color: #333; font-size: 14px; }
              .details { margin: 10px 0; font-size: 12px; }
              .details p { margin: 3px 0; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
              th { border: 1px solid #ddd; padding: 5px; text-align: left; background-color: #f5f5f5; font-size: 10px; font-weight: bold; }
              td { border: 1px solid #ddd; padding: 5px; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 10px; text-align: center; font-size: 10px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Delivery Receipt</h1>
            </div>
            <div class="details">
              <p><strong>Date:</strong> ${data.delivered_date}</p>
              <p><strong>Time:</strong> ${data.delivered_time}</p>
              <p><strong>Parcels:</strong> ${data.delivered_count}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                ${parcelsHtml}
              </tbody>
            </table>
            <div class="footer">
              <p>Auto-generated receipt</p>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error("Failed to print:", error);
      toast.error("Failed to print delivery receipt");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintViaBridge = async () => {
    if (!data) return;

    try {
      setIsPrinting(true);

      // Create minimal bridge data payload
      const bridgeData = {
        delivery_date: data.delivered_date,
        delivery_time: data.delivered_time,
        delivered_count: data.delivered_count,
        parcels: data.parcels,
      };

      const jsonPayload = JSON.stringify(bridgeData);
      console.log("Bridge payload:", jsonPayload.length, "bytes");

      const encodedData = encodeURIComponent(jsonPayload);
      const bridgeUrl = `mzigo://print?data=${encodedData}`;

      console.log("Bridge URL length:", bridgeUrl.length, "bytes");

      // Setup callback listener for print completion
      const handleBridgeCallback = (event: MessageEvent) => {
        if (event.data?.type === "print_complete") {
          console.log("✓ Print completed via bridge app");
          toast.success("Delivery receipt printed successfully");
          window.removeEventListener("message", handleBridgeCallback);
          setIsPrinting(false);
        }
      };

      window.addEventListener("message", handleBridgeCallback);

      // Set a timeout to remove listener if no response
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

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delivery Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Receipt Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold">{data.delivered_date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold">{data.delivered_time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parcels Delivered</p>
                <p className="font-semibold text-lg text-green-600">{data.delivered_count}</p>
              </div>
            </div>
          </div>

          {/* Delivered Parcels List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Delivered Parcels:</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Receipt Number</th>
                    <th className="px-4 py-2 text-left font-semibold">Receiver Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parcels.map((parcel, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                      <td className="px-4 py-2">{parcel.receipt_number}</td>
                      <td className="px-4 py-2">{parcel.receiver_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={!data || isPrinting}>
                {isPrinting ? "Processing..." : "Actions"}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrintViaBridge} disabled={isPrinting}>
                <DevicePhoneMobileIcon className="mr-2 h-4 w-4" />
                Print via Bridge App
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBrowserPrint("58mm")} disabled={isPrinting}>
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print (58mm - P-50)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBrowserPrint("80mm")} disabled={isPrinting}>
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print (80mm)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeliveryCard({ item }: { item: DeliveryItem }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Parcel Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{item.receipt_number}</p>
              <p className="text-xs text-muted-foreground">{item.parcel_description}</p>
            </div>
            {/* <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              KES {item.amount_charged}
            </span> */}
          </div>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">From:</span> {item.sender_name} ({item.sender_phone})
            </p>
            <p>
              <span className="font-medium">To:</span> {item.receiver_name} ({item.receiver_town_name})
            </p>
            <p>
              <span className="font-medium">Payment:</span> {item.payment_mode}
            </p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-2">
          <div className="bg-muted p-3 rounded-md space-y-2">
            {item.is_delivered === "1" && (
              <>
                <div className="text-sm">
                  <p className="font-medium">Vehicle: {item.delivery_vehicle}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.delivered_date).toLocaleDateString()} at {item.delivered_time}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground">Delivered by: {item.delivered_by_name}</p>
                </div>
                {item.delivered_notes && (
                  <p className="text-xs text-muted-foreground italic">&quot;{item.delivered_notes}&quot;</p>
                )}
              </>
            )}
            {item.is_delivered === "0" && (
              <div className="text-sm">
                <p className="font-medium text-amber-600">Pending Delivery</p>
                <p className="text-xs text-muted-foreground">Created on {item.s_date}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ParcelSearchResult({
  parcel,
  isSelected,
  onSelect,
}: {
  parcel: SearchMzigoItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-primary border-2 bg-primary/5" : "hover:bg-muted"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{parcel.receipt_number}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-white">
              {parcel.active_status === "1" ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{parcel.sender_name}</span>
            {" → "}
            <span className="font-medium text-foreground">{parcel.receiver_name}</span>
          </p>
          <p className="text-xs text-muted-foreground">{parcel.parcel_description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-muted rounded">
              {parcel.receiver_phone}
            </span>
            <span className="text-xs text-muted-foreground">
              KES {parcel.amount_charged}
            </span>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 shrink-0 mt-1 cursor-pointer"
        />
      </div>
    </Card>
  );
}
