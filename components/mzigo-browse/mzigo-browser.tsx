"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useBrowseMzigo } from "@/hooks/mzigo";
import { useDestinations } from "@/hooks/data";
import type { BrowseMzigoItem, BrowseMzigoParams, TrafficType } from "@/types/operations/browse-mzigo";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function MzigoBrowser() {
  const [filters, setFilters] = useState<BrowseMzigoParams>({
    type: "outgoing",
    start_date: today(),
    end_date: today(),
  });
  const [activeFilters, setActiveFilters] = useState<BrowseMzigoParams | null>(null);
  const [destinationId, setDestinationId] = useState("");

  const { data, count, dateRange, type, isLoading, error } = useBrowseMzigo(activeFilters);
  const { data: destinations, isLoading: loadingDestinations } = useDestinations();

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params: BrowseMzigoParams = {
      ...filters,
    };
    if (destinationId) {
      params.destination_id = destinationId;
    }
    setActiveFilters(params);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleApplyFilters} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="type">Traffic Type</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as TrafficType })}
            >
              <option value="outgoing">Outgoing</option>
              <option value="incoming">Incoming</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination_id">Destination (Optional)</Label>
            <select
              id="destination_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              disabled={loadingDestinations}
            >
              <option value="">All Destinations</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit">Apply Filters</Button>
      </form>

      {activeFilters && (
        <>
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {error && (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">⚠️</div>
                <EmptyTitle>Error</EmptyTitle>
                <EmptyDescription>{error.message}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && data.length === 0 && (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">📦</div>
                <EmptyTitle>No Mzigos Found</EmptyTitle>
                <EmptyDescription>
                  No {type} mzigos found for the selected date range
                  {dateRange && ` (${dateRange.start_date} to ${dateRange.end_date})`}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && data.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {count} {type} mzigo{count !== 1 ? "s" : ""}
                  {dateRange && ` (${dateRange.start_date} to ${dateRange.end_date})`}
                </p>
              </div>
              {data.map((mzigo) => (
                <BrowseResultCard key={mzigo.id} mzigo={mzigo} type={type} />
              ))}
            </div>
          )}
        </>
      )}

      {!activeFilters && (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">🔍</div>
            <EmptyTitle>Ready to Browse</EmptyTitle>
            <EmptyDescription>
              Select your filters and click "Apply Filters" to view mzigos
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

function BrowseResultCard({ mzigo, type }: { mzigo: BrowseMzigoItem; type?: string }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Receipt #{mzigo.receipt_number}</h3>
            <div className="flex gap-2">
              <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">
                {mzigo.active_status === "1" ? "Active" : "Inactive"}
              </span>
              {type && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded capitalize">
                  {type}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {mzigo.sender_name}({mzigo.sender_phone}) → {mzigo.receiver_name}({mzigo.receiver_phone})
          </p>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="font-medium">From:</span> {mzigo.sender_town} 
            </p>
            <p>
              <span className="font-medium">To:</span> {mzigo.receiver_town}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{mzigo.amount_charged}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span>{mzigo.payment_mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle:</span>
              <span>{mzigo.p_vehicle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span>{mzigo.package_size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{mzigo.s_date} {mzigo.s_time}</span>
            </div>
            
          </div>
        </div>
      </div>
    </Card>
  );
}
