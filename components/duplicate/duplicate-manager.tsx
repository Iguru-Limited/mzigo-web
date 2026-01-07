"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useParcels } from "@/hooks/duplicate/use-parcels";

export function DuplicateManager() {
  const { items, isLoading, error } = useParcels();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(5);

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

  const handleReprintReceipt = (receiptNumber: string) => {
    toast.info(`Reprint functionality for ${receiptNumber} coming soon`);
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
                    onClick={() => handleReprintReceipt(parcel.receipt_number)}
                    className="w-full"
                  >
                    Reprint Receipt
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
    </div>
  );
}
