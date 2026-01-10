"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrowseMzigo } from "@/hooks/mzigo";
import { useDestinations } from "@/hooks/data";
import type { BrowseMzigoItem, BrowseMzigoParams, TrafficType } from "@/types/operations/browse-mzigo";
import { Search, Calendar, MapPin, Package } from "lucide-react";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MzigoBrowser() {
  const [trafficType, setTrafficType] = useState<TrafficType>("outgoing");
  const [selectedDate, setSelectedDate] = useState(today());
  const [destinationId, setDestinationId] = useState("");
  const [activeFilters, setActiveFilters] = useState<BrowseMzigoParams | null>(null);

  const { data, count, dateRange, type, isLoading, error } = useBrowseMzigo(activeFilters);
  const { data: destinations, isLoading: loadingDestinations } = useDestinations();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: BrowseMzigoParams = {
      type: trafficType,
      start_date: selectedDate,
      end_date: selectedDate,
    };
    if (destinationId) {
      params.destination_id = destinationId;
    }
    setActiveFilters(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse/Search</h1>
      </div>

      {/* Traffic Type Tabs */}
      <div className="flex gap-8 border-b border-gray-200">
        <button
          onClick={() => setTrafficType("outgoing")}
          className={`pb-3 font-semibold text-base transition-colors relative ${
            trafficType === "outgoing"
              ? "text-cyan-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${trafficType === "outgoing" ? "bg-cyan-500" : "bg-gray-400"}`}></div>
            Outgoing
          </div>
          {trafficType === "outgoing" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"></div>
          )}
        </button>

        <button
          onClick={() => setTrafficType("incoming")}
          className={`pb-3 font-semibold text-base transition-colors relative ${
            trafficType === "incoming"
              ? "text-cyan-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${trafficType === "incoming" ? "bg-cyan-500" : "bg-gray-400"}`}></div>
            Incoming
          </div>
          {trafficType === "incoming" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"></div>
          )}
        </button>
      </div>

      {/* Filters Section */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="space-y-4">
            {/* Date Filter */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-cyan-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatDate(selectedDate)}</p>
            </div>

            {/* Destination Filter */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  disabled={loadingDestinations}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-cyan-500 appearance-none"
                >
                  <option value="">All</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 h-auto flex items-center justify-center gap-2 rounded-lg"
        >
          <Search className="w-5 h-5" />
          Search
        </Button>
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
                <div className="text-5xl text-cyan-500 mb-3"><Package className="w-12 h-12" /></div>
                <EmptyTitle>Search for Parcels</EmptyTitle>
                <EmptyDescription>
                  Select a date and destination, then tap Search to view {trafficType} parcels
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && data.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found {count} {trafficType} mzigo{count !== 1 ? "s" : ""}
                </p>
              </div>
              {data.map((mzigo) => (
                <BrowseResultCard key={mzigo.id} mzigo={mzigo} type={trafficType} />
              ))}
            </div>
          )}
        </>
      )}

      {!activeFilters && (
        <Empty>
          <EmptyHeader>
            <div className="text-5xl text-cyan-500 mb-3"><Package className="w-12 h-12" /></div>
            <EmptyTitle>Search for Parcels</EmptyTitle>
            <EmptyDescription>
              Select a date and destination, then tap Search to view {trafficType} parcels
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
