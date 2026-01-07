"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { VehicleInput } from "@/components/ui/vehicle-input";
import { DestinationInput } from "@/components/ui/destination-input";
import { toast } from "sonner";
import { useLoadingSheets } from "@/hooks/dispatch/use-loading-sheets";
import { useCreateDispatch } from "@/hooks/dispatch/use-create-dispatch";
import { useVehicles } from "@/hooks/data/use-vehicles";
import { useDestinations } from "@/hooks/data/use-destinations";

type TabType = "undispatched" | "dispatched";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function DispatchManager() {
  const [activeTab, setActiveTab] = useState<TabType>("undispatched");
  const [startDate, setStartDate] = useState<string>(today());
  const [endDate, setEndDate] = useState<string>(today());
  const [displayCount, setDisplayCount] = useState(5);
  const [showDispatchDialog, setShowDispatchDialog] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [courier, setCourier] = useState<string>("");
  const [endTown, setEndTown] = useState<string>("");
  const [courierContacts, setCourierContacts] = useState<string>("");
  const [isDispatching, setIsDispatching] = useState(false);
  
  const { sheets: undispatchedSheets, isLoading: isLoadingUndispatched, error: errorUndispatched, refresh: refreshUndispatched } = useLoadingSheets({
    type: "undispatched",
  });
  
  const { sheets: dispatchedSheets, isLoading: isLoadingDispatched, error: errorDispatched, refresh: refreshDispatched } = useLoadingSheets({
    type: "dispatched",
  });

  const { createDispatch } = useCreateDispatch();
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { data: destinations, isLoading: destinationsLoading, error: destinationsError } = useDestinations();

  // Filter by date range
  const filteredSheets = useMemo(() => {
    const sheets = activeTab === "undispatched" ? undispatchedSheets : dispatchedSheets;
    if (!startDate || !endDate) return sheets;

    return sheets.filter((sheet) => {
      const dateToCheck = activeTab === "dispatched" && sheet.dispatch_date 
        ? sheet.dispatch_date.split(" ")[0] 
        : sheet.created_at.split(" ")[0];
      return dateToCheck >= startDate && dateToCheck <= endDate;
    });
  }, [activeTab, undispatchedSheets, dispatchedSheets, startDate, endDate]);

  const displayedSheets = filteredSheets.slice(0, displayCount);
  const hasMore = filteredSheets.length > displayCount;

  const isLoading = activeTab === "undispatched" ? isLoadingUndispatched : isLoadingDispatched;
  const error = activeTab === "undispatched" ? errorUndispatched : errorDispatched;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setDisplayCount(5); // Reset to first 5 when switching tabs
  };

  const handleDispatch = (sheetNumber: string) => {
    setSelectedSheet(sheetNumber);
    setShowDispatchDialog(true);
  };

  const handleSubmitDispatch = async () => {
    if (!courier || !endTown || !courierContacts) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsDispatching(true);
      await createDispatch({
        sheet_number: selectedSheet,
        courier,
        end_town: endTown,
        courier_contacts: courierContacts,
      });
      toast.success("Dispatch created successfully");
      setShowDispatchDialog(false);
      setCourier("");
      setEndTown("");
      setCourierContacts("");
      setSelectedSheet("");
      refreshUndispatched();
      refreshDispatched();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create dispatch");
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dispatch Management</h2>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex gap-1">
          <Button
            variant={activeTab === "undispatched" ? "default" : "ghost"}
            onClick={() => handleTabChange("undispatched")}
            className="flex-1"
          >
            Undispatched ({undispatchedSheets.length})
          </Button>
          <Button
            variant={activeTab === "dispatched" ? "default" : "ghost"}
            onClick={() => handleTabChange("dispatched")}
            className="flex-1"
          >
            Dispatched ({dispatchedSheets.length})
          </Button>
        </div>
      </Card>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        {filteredSheets.length > 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            Showing {displayedSheets.length} of {filteredSheets.length} sheet{filteredSheets.length !== 1 ? 's' : ''}
          </p>
        )}
      </Card>

      <Separator />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="h-4 w-4" /> Loading loading sheets…
        </div>
      ) : error ? (
        <div className="text-sm text-red-600">{error.message}</div>
      ) : filteredSheets.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">📦</div>
            <EmptyTitle>No {activeTab === "undispatched" ? "Undispatched" : "Dispatched"} Sheets</EmptyTitle>
            <EmptyDescription>
              {activeTab === "undispatched"
                ? "All loading sheets have been dispatched or no sheets in selected date range"
                : "No loading sheets have been dispatched in selected date range"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4">
            {displayedSheets.map((sheet) => (
              <Card key={sheet.id} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{sheet.sheet_number}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {sheet.created_at}
                      </p>
                      {sheet.dispatch_date && (
                        <p className="text-xs text-green-600">
                          Dispatched: {sheet.dispatch_date}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                      {sheet.parcel_count} parcel{sheet.parcel_count !== "1" ? "s" : ""}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium text-muted-foreground">Destination</p>
                      <p className="font-semibold">{sheet.destination_name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Vehicle</p>
                      <p className="font-semibold">{sheet.vehicle}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Loading Date</p>
                      <p className="font-semibold">{sheet.loading_date}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Sheet ID</p>
                      <p className="font-semibold">#{sheet.id}</p>
                    </div>
                  </div>

                  {/* Action Button - Only for undispatched */}
                  {activeTab === "undispatched" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDispatch(sheet.sheet_number)}
                      className="w-full"
                    >
                      Dispatch
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More ({displayCount} / {filteredSheets.length})
              </Button>
            </div>
          )}
        </>
      )}

      {/* Dispatch Dialog */}
      <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dispatch Loading Sheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Sheet: <span className="font-semibold">{selectedSheet}</span>
              </p>
            </div>

            <div>
              <VehicleInput
                value={courier}
                onChange={setCourier}
                vehicles={vehicles}
                isLoading={vehiclesLoading}
                error={vehiclesError}
                placeholder="Select courier vehicle"
                required
              />
            </div>

            <div>
              <DestinationInput
                value={endTown}
                onChange={setEndTown}
                destinations={destinations}
                isLoading={destinationsLoading}
                error={destinationsError}
                placeholder="Select end town"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Courier Contacts
              </label>
              <Input
                type="text"
                placeholder="Enter courier contact number"
                value={courierContacts}
                onChange={(e) => setCourierContacts(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDispatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitDispatch} disabled={isDispatching || !courier || !endTown || !courierContacts}>
              {isDispatching ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Dispatching...
                </>
              ) : (
                "Confirm Dispatch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
