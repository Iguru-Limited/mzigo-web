"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrowseMzigo, useAttendants } from "@/hooks/mzigo";
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
  const [selectedAttendantId, setSelectedAttendantId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<BrowseMzigoParams | null>(null);

  const { data, count, dateRange, type, isLoading, error } = useBrowseMzigo(activeFilters);
  const { data: destinations, isLoading: loadingDestinations } = useDestinations();
  const { data: attendants, isLoading: attendantsLoading, error: attendantsError } = useAttendants();

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
    if (selectedAttendantId) {
      params.user_id = selectedAttendantId;
    }
    setActiveFilters(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Browse/Search</h1>
      </div>

      {/* Traffic Type Tabs */}
      <div className="flex gap-8 border-b border-border justify-center items-center">
        <button
          onClick={() => setTrafficType("outgoing")}
          className={`pb-3 font-semibold text-base transition-colors relative hover:cursor-pointer ${
            trafficType === "outgoing"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2  rounded-full ${trafficType === "outgoing" ? "bg-primary" : "bg-muted-foreground"}`}></div>
            Outgoing
          </div>
          {trafficType === "outgoing" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>

        <button
          onClick={() => setTrafficType("incoming")}
          className={`pb-3 font-semibold hover:cursor-pointer text-base transition-colors relative ${
            trafficType === "incoming"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${trafficType === "incoming" ? "bg-primary" : "bg-muted-foreground"}`}></div>
            Incoming
          </div>
          {trafficType === "incoming" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex justify-center">
        <form onSubmit={handleSearch} className="space-y-2 space-x-2 w-full max-w-2xl">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-input rounded-lg text-sm font-medium text-foreground focus:outline-none focus:bg-background focus:border-ring"
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
            {/* Attendant Filter */}
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Attendants</label>
              {attendantsLoading && <Skeleton className="h-8 w-full" />}
              {attendantsError && (
                <p className="text-xs text-red-600">{attendantsError.message || "Failed to load attendants"}</p>
              )}
              {!attendantsLoading && !attendantsError && (
                <div className="flex flex-wrap gap-2">
                  <Badge
                    asChild
                    variant={selectedAttendantId ? "outline" : "default"}
                    className="cursor-pointer"
                  >
                    <button type="button" onClick={() => setSelectedAttendantId(null)}>
                      All
                    </button>
                  </Badge>
                  {attendants.map((attendant) => {
                    const isActive = attendant.id === selectedAttendantId;
                    return (
                      <Badge
                        key={attendant.id}
                        asChild
                        variant={isActive ? "default" : "outline"}
                        className="cursor-pointer"
                      >
                        <button type="button" onClick={() => setSelectedAttendantId(attendant.id)}>
                          {attendant.name}
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

           
          </div>
        </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="w-full font-semibold py-2.5 h-auto flex items-center justify-center gap-2 rounded-lg"
            variant="default"
          >
            <Search className="w-5 h-5" />
            Search
          </Button>
        </form>
      </div>

      {activeFilters && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
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
                <div className="text-5xl text-primary mb-3"><Package className="w-12 h-12" /></div>
                <EmptyTitle>Search for Parcels</EmptyTitle>
                <EmptyDescription>
                  Select a date and destination, then tap Search to view {trafficType} parcels
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && data.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  Found {count} {trafficType} mzigo{count !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((mzigo) => (
                  <BrowseResultCard key={mzigo.id} mzigo={mzigo} type={trafficType} />
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {!activeFilters && (
        <Empty>
          <EmptyHeader>
            <div className="text-5xl text-primary mb-3"><Package className="w-12 h-12" /></div>
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
    <Card className="p-4 hover:shadow-md transition-shadow h-full">
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Receipt #{mzigo.receipt_number}</h3>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                {mzigo.active_status === "1" ? "Active" : "Inactive"}
              </span>
              {type && (
                <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded capitalize">
                  {type}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {mzigo.sender_name} → {mzigo.receiver_name}
          </p>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="text-muted-foreground">From:</span>
              <p className="font-medium">{mzigo.sender_town}</p>
            </div>
            <div>
              <span className="text-muted-foreground">To:</span>
              <p className="font-medium">{mzigo.receiver_town}</p>
            </div>
          </div>
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">{mzigo.amount_charged}</span>
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
              <span>{mzigo.s_date}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
