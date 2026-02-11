"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { DestinationInput } from "@/components/ui/destination-input";
import { PreviewDialog, type PreviewAction } from "@/components/ui/preview-dialog";
import { ChevronDownIcon, PrinterIcon, DevicePhoneMobileIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDestinations } from "@/hooks/data/use-destinations";
import { useVehicles } from "@/hooks/data/use-vehicles";
import { useUnloadedParcels } from "@/hooks/loading/use-unloaded-parcels";
import { useCreateLegacyLoading } from "@/hooks/loading/use-create-legacy-loading";
import { useCreateDirectLoading } from "@/hooks/loading/use-create-direct-loading";
import { useCreateDetailedLoading } from "@/hooks/loading/use-create-detailed-loading";
import { useUpdateDetailedLoading } from "@/hooks/loading/use-update-detailed-loading";
import { VehicleInput } from "@/components/ui/vehicle-input";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const modeTitles: Record<string, string> = {
  legacy: "Legacy Loading",
  detailed: "Detailed Loading",
  direct: "Direct Loading",
};

export function LoadingManager() {
  const params = useSearchParams();
  const mode = params.get("mode") || "legacy";
  const title = modeTitles[mode] || "Loading";

  // Destination selection (by name via DestinationInput, then map to id)
  const { data: destinations, isLoading: isDestLoading, error: destError } = useDestinations();
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const [destinationName, setDestinationName] = useState<string>("");
  const selectedDestinationId = useMemo(() => {
    const match = destinations.find(d => d.name.toLowerCase() === destinationName.trim().toLowerCase());
    return match?.id ?? null;
  }, [destinationName, destinations]);

  // Date range (defaults: today)
  const [startDate, setStartDate] = useState<string>(today());
  const [endDate, setEndDate] = useState<string>(today());

  const { items, isLoading, error, refresh } = useUnloadedParcels({
    startDate,
    endDate,
    destinationId: selectedDestinationId,
  });

  // Clear selections when destination or date range changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedDestinationId, startDate, endDate]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  // Create loading sheet
  const { createLoadingSheet } = useCreateLegacyLoading();
  const { createLoadingSheet: createDirectLoadingSheet } = useCreateDirectLoading();
  const { createDetailedSheet } = useCreateDetailedLoading();
  const { updateDetailedSheet } = useUpdateDetailedLoading();
  const [isCreating, setIsCreating] = useState(false);
  const [sheetPreview, setSheetPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [detailedSheetNumber, setDetailedSheetNumber] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map(it => it.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectParcel = (id: string, checked: boolean) => {
    const updated = new Set(selectedIds);
    if (checked) {
      updated.add(id);
    } else {
      updated.delete(id);
    }
    setSelectedIds(updated);
  };

  const handleCreateDetailedSheet = async () => {
    if (!selectedDestinationId || !selectedVehicle) {
      alert("Please select destination and vehicle");
      return;
    }
    try {
      setIsCreating(true);
      const res = await createDetailedSheet({
        destination_id: parseInt(String(selectedDestinationId)),
        vehicle: selectedVehicle,
      });
      setDetailedSheetNumber(res?.sheet_number || null);
      toast.success("Loading sheet created successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create detailed sheet");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddParcelsToDetailedSheet = async () => {
    if (!detailedSheetNumber || selectedIds.size === 0) {
      alert("Create a sheet and select parcels first");
      return;
    }
    try {
      setIsCreating(true);
      const res = await updateDetailedSheet({
        sheet_number: detailedSheetNumber,
        parcel_ids: Array.from(selectedIds).map((id) => parseInt(id)),
      });
      setSheetPreview(res);
      setShowPreview(true);
      setSelectedIds(new Set());
      toast.success("Loading sheet updated successfully.");
      refresh(); // Refresh to show updated parcel list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update sheet");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateLoadingSheet = async () => {
    if (selectedIds.size === 0 || !selectedDestinationId) {
      alert("Please select parcels and a destination");
      return;
    }
    try {
      setIsCreating(true);
      const result = await createLoadingSheet({
        parcel_ids: Array.from(selectedIds).map(id => parseInt(id)),
        destination_id: parseInt(String(selectedDestinationId)),
      });
      setSheetPreview(result);
      setShowPreview(true);
      setSelectedIds(new Set()); // Clear selection
      refresh(); // Refresh to show updated parcel list
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create loading sheet");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePrint = (paperWidth: "58mm" | "80mm") => {
    if (!sheetPreview) return;
    try {
      // Create a printable HTML representation of the loading sheet
      const printWindow = window.open("", "PRINT", "height=600,width=800");
      if (!printWindow) return;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Loading Sheet ${sheetPreview.sheet_number}</title>
          <style>
            body { font-family: monospace; margin: 10px; font-size: ${paperWidth === "58mm" ? "10px" : "12px"}; }
            .header { text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 10px; }
            .sheet-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
            .parcel-row { border-bottom: 1px solid #ddd; padding: 5px 0; }
            .parcel-row:last-child { border-bottom: none; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-weight: bold; border-bottom: 1px solid #000; }
            td { padding: 3px; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>LOADING SHEET</h2>
            <p>${sheetPreview.sheet_number}</p>
          </div>
          <div class="sheet-info">
            <div><strong>Sheet ID:</strong> ${sheetPreview.loading_sheet_id}</div>
            <div><strong>Loaded Count:</strong> ${sheetPreview.loaded_count}</div>
            <div><strong>Total Parcels:</strong> ${sheetPreview.parcels?.length || 0}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Waybill</th>
                <th>Description</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${sheetPreview.parcels?.map((p: any) => `
                <tr>
                  <td>${p.receipt_number}</td>
                  <td>${p.parcel_description}</td>
                  <td>${p.sender_name}</td>
                  <td>${p.receiver_name}</td>
                  <td>${p.amount_charged}</td>
                </tr>
              `).join("") || ""}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to print loading sheet");
    }
  };

  const handlePrintViaBridge = () => {
    if (!sheetPreview) return;
    const encodedData = encodeURIComponent(JSON.stringify(sheetPreview));
    const bridgeUrl = `mzigo://print-sheet?data=${encodedData}`;
    window.location.href = bridgeUrl;
    setTimeout(() => {
      alert("Print Bridge app not found. Please install the MZIGO Bridge app to use this feature.");
    }, 2000);
  };

  const handleDownloadLoadingSheet = async () => {
    if (!sheetPreview) return;
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      // Create clean HTML with inline styles (no external CSS/Tailwind to avoid lab() color parsing)
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Loading Sheet ${sheetPreview.sheet_number}</title>
          <style>
            * { 
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body { 
              width: 100%;
              margin: 0;
              padding: 0;
              background-color: white;
              color: black;
            }
            body { 
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
              padding: 20px;
            }
            .container {
              width: 100%;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000000; 
              padding-bottom: 10px; 
            }
            .header h2 {
              font-size: 18px;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .header p {
              font-size: 14px;
              font-weight: bold;
            }
            .info { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr; 
              gap: 15px; 
              margin-bottom: 20px;
            }
            .info-item { 
              padding: 8px;
              font-size: 12px;
            }
            .info-item strong {
              display: block;
              margin-bottom: 3px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            thead {
              background-color: #f0f0f0;
            }
            th { 
              padding: 8px; 
              text-align: left; 
              border: 1px solid #cccccc;
              font-weight: bold;
              font-size: 11px;
            }
            td { 
              padding: 8px; 
              border: 1px solid #cccccc;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>LOADING SHEET</h2>
              <p>Sheet #${sheetPreview.sheet_number}</p>
            </div>
            <div class="info">
              <div class="info-item"><strong>Total Parcels:</strong> ${sheetPreview.parcels?.length || 0}</div>
              <div class="info-item"><strong>Loaded:</strong> ${sheetPreview.loaded_count}</div>
              <div class="info-item"><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Waybill</th>
                  <th>Description</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${sheetPreview.parcels?.map((p: any) => `
                  <tr>
                    <td>${p.receipt_number || "-"}</td>
                    <td>${p.parcel_description || "-"}</td>
                    <td>${p.sender_name || "-"}</td>
                    <td>${p.receiver_name || "-"}</td>
                    <td>${p.amount_charged || "-"}</td>
                  </tr>
                `).join("") || ""}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;

      // Create a temporary container with only basic inline styles
      const container = document.createElement("div");
      container.innerHTML = html;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "210mm";
      container.style.backgroundColor = "white";
      container.style.color = "black";
      
      document.body.appendChild(container);

      try {
        // Convert HTML to canvas with minimal config to avoid color parsing issues
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          allowTaint: true,
          removeContainer: false,
          windowHeight: container.scrollHeight,
        });

        // Create PDF from canvas
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        // Trigger download
        pdf.save(`loading-sheet-${sheetPreview.sheet_number}.pdf`);

        toast.success("Loading sheet downloaded successfully!", {
          description: `Sheet #${sheetPreview.sheet_number} has been downloaded.`,
        });
      } finally {
        // Clean up
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      }
    } catch (error) {
      console.error("Failed to download loading sheet:", error);
      toast.error("Failed to download loading sheet", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleCreateDirectLoadingSheet = async () => {
    if (selectedIds.size === 0) {
      alert("Please select parcels");
      return;
    }
    setShowVehicleDialog(true);
  };

  const handleSubmitDirectLoading = async () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle");
      return;
    }
    try {
      setIsCreating(true);
      await createDirectLoadingSheet({
        parcel_ids: Array.from(selectedIds).map(id => parseInt(id)),
        vehicle: selectedVehicle,
      });
      toast.success("Parcel loaded successfully.");
      setShowVehicleDialog(false);
      setSelectedIds(new Set()); // Clear selection
      setSelectedVehicle(""); // Clear vehicle selection
      // Refresh the list to see updated status
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load parcel");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <div className="flex justify-center">
        <Card className="p-4 w-full max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <DestinationInput
              value={destinationName}
              onChange={setDestinationName}
              destinations={destinations}
              isLoading={isDestLoading}
              error={destError}
              placeholder="Select destination"
              required
              requireRoute={false}
            />
          </div>
          {mode === "detailed" && (
            <div>
              <VehicleInput
                value={selectedVehicle}
                onChange={setSelectedVehicle}
                vehicles={vehicles}
                isLoading={vehiclesLoading}
                error={vehiclesError}
                placeholder="Select vehicle"
                required
              />
            </div>
          )}
        </div>
      </Card>
      </div>

      <Separator />

      {mode === "detailed" && (
        <div className="flex justify-center">
          <div className="flex gap-2 flex-col sm:flex-row w-full max-w-2xl">
          <Button
            onClick={handleCreateDetailedSheet}
            disabled={isCreating || !selectedDestinationId || !selectedVehicle}
            className="w-full md:w-auto"
          >
            {isCreating ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Creating...
              </>
            ) : (
              "Create Detailed Sheet"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddParcelsToDetailedSheet}
            disabled={isCreating || !detailedSheetNumber || selectedIds.size === 0}
            className="w-full md:w-auto"
          >
            {isCreating ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Updating...
              </>
            ) : (
              detailedSheetNumber ? `Add Selected to ${detailedSheetNumber}` : "Add Selected to Sheet"
            )}
          </Button>
        </div>
        </div>
      )}

      {items.length > 0 && selectedIds.size > 0 && mode !== "detailed" && (
        <div className="flex justify-center">
          <div className="flex gap-2 flex-col sm:flex-row w-full max-w-2xl">
          {mode === "direct" ? (
            <Button
              onClick={handleCreateDirectLoadingSheet}
              disabled={isCreating}
              className="w-full md:w-auto"
            >
              {isCreating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Loading...
                </>
              ) : (
                `Load to Vehicle (${selectedIds.size} parcel${selectedIds.size !== 1 ? 's' : ''})`
              )}
            </Button>
          ) : (
            <Button
              onClick={handleCreateLoadingSheet}
              disabled={isCreating}
              className="w-full md:w-auto"
            >
              {isCreating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                `Create Loading Sheet (${selectedIds.size} parcel${selectedIds.size !== 1 ? 's' : ''})`
              )}
            </Button>
          )}
        </div>
        </div>
      )}

      <Separator />

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner className="h-4 w-4" /> Loading unloaded parcels…</div>
          ) : error ? (
                <div className="text-sm text-red-600">{error.message}</div>
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">📦</div>
                <EmptyTitle>No Unloaded Parcels</EmptyTitle>
                <EmptyDescription>Adjust filters to see more results.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
          {/* Select All Bar - Mobile */}
          <div className="md:hidden flex items-center gap-3 p-3 bg-muted rounded-md">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium">Select All ({selectedIds.size}/{items.length})</span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Waybill</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-left">Sender</th>
                  <th className="px-3 py-2 text-left">Receiver</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Vehicle</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-3 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(it.id)}
                        onChange={(e) => handleSelectParcel(it.id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{it.receipt_number}</td>
                    <td className="px-3 py-2">{it.parcel_description}</td>
                    <td className="px-3 py-2">{it.sender_name} ({it.sender_town})</td>
                    <td className="px-3 py-2">{it.receiver_name} ({it.receiver_town})</td>
                    <td className="px-3 py-2">{it.s_date} {it.s_time}</td>
                    <td className="px-3 py-2">{it.p_vehicle}</td>
                    <td className="px-3 py-2">{it.amount_charged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-3">
            {items.map((it) => (
              <Card key={it.id} className="p-4">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(it.id)}
                    onChange={(e) => handleSelectParcel(it.id, e.target.checked)}
                    className="cursor-pointer mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{it.receipt_number}</p>
                        <p className="text-xs text-muted-foreground">{it.parcel_description}</p>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">{it.amount_charged}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p><span className="font-medium">From:</span> {it.sender_name} ({it.sender_town})</p>
                      <p><span className="font-medium">To:</span> {it.receiver_name} ({it.receiver_town})</p>
                      <p><span className="font-medium">Date:</span> {it.s_date} {it.s_time}</p>
                      <p><span className="font-medium">Vehicle:</span> {it.p_vehicle}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          </>
        )}
        </div>
      </div>

      {/* Preview Modal using reusable PreviewDialog */}
      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Loading Sheet Preview"
        maxWidth="3xl"
        actions={
          sheetPreview
            ? [
                {
                  label: "Print via Bridge App",
                  icon: <DevicePhoneMobileIcon className="w-4 h-4" />,
                  onClick: handlePrintViaBridge,
                  separator: true,
                },
                {
                  label: "Print (58mm - P-50)",
                  icon: <PrinterIcon className="w-4 h-4" />,
                  onClick: () => handlePrint("58mm"),
                },
                {
                  label: "Print (80mm)",
                  icon: <PrinterIcon className="w-4 h-4" />,
                  onClick: () => handlePrint("80mm"),
                  separator: true,
                },
                {
                  label: "Download Sheet",
                  icon: <ArrowDownTrayIcon className="w-4 h-4" />,
                  onClick: async () => {
                    await handleDownloadLoadingSheet();
                    setShowPreview(false);
                  },
                },
              ]
            : []
        }
      >
        {sheetPreview && (
          <div className="rounded border p-4 bg-white max-h-[60vh] overflow-auto">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Sheet Number</p>
                    <p className="font-bold text-base">{sheetPreview.sheet_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loading Sheet ID</p>
                    <p className="font-bold text-base">{sheetPreview.loading_sheet_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loaded Count</p>
                    <p className="font-semibold text-base">{sheetPreview.loaded_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Parcels</p>
                    <p className="font-semibold text-base">{sheetPreview.parcels?.length || 0}</p>
                  </div>
                </div>

                {/* Parcels List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Loaded Parcels</h3>
                  <div className="space-y-2">
                    {sheetPreview.parcels?.map((p: any) => (
                      <div key={p.id} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{p.receipt_number}</p>
                            <p className="text-xs text-muted-foreground">{p.parcel_description}</p>
                          </div>
                          <span className="font-semibold">{p.amount_charged}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">From: </span>
                            <span>{p.sender_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <span>{p.receiver_name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
        )}
      </PreviewDialog>

      {/* Vehicle Selection Dialog - For Direct Loading */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a vehicle to load {selectedIds.size} parcel{selectedIds.size !== 1 ? 's' : ''}
            </p>
            <VehicleInput
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              vehicles={vehicles}
              isLoading={vehiclesLoading}
              error={vehiclesError}
              placeholder="Select vehicle"
              required
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitDirectLoading} disabled={isCreating || !selectedVehicle}>
              {isCreating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Loading...
                </>
              ) : (
                "Load Parcels"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
