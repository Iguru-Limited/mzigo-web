"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLoadingSheets } from "@/hooks/dispatch/use-loading-sheets";

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
  
  const { sheets: undispatchedSheets, isLoading: isLoadingUndispatched, error: errorUndispatched } = useLoadingSheets({
    type: "undispatched",
  });
  
  const { sheets: dispatchedSheets, isLoading: isLoadingDispatched, error: errorDispatched } = useLoadingSheets({
    type: "dispatched",
  });

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
    toast.info(`Dispatch functionality for ${sheetNumber} coming soon`);
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
    </div>
  );
}
