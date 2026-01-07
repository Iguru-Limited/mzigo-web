"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useSearchMzigo } from "@/hooks/mzigo";
import type { SearchMzigoItem } from "@/types/operations/search-mzigo";

export function MzigoSearcher() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const { results, isLoading, error } = useSearchMzigo(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Mzigo</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Enter tracking number, phone, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </div>
        </div>
      </form>

      {activeQuery && (
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

          {!isLoading && !error && results.length === 0 && (
            <Empty>
              <EmptyHeader>
                <div className="text-4xl">🔍</div>
                <EmptyTitle>No Results</EmptyTitle>
                <EmptyDescription>No Mzigos found matching "{activeQuery}"</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((mzigo) => (
                <SearchResultCard key={mzigo.id} mzigo={mzigo} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SearchResultCard({ mzigo }: { mzigo: SearchMzigoItem }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Receipt #{mzigo.receipt_number}</h3>
            <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">
              {mzigo.active_status === "1" ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {mzigo.sender_name} → {mzigo.receiver_name}
          </p>
          <p className="text-sm">
            <span className="font-medium">From:</span> {mzigo.sender_town}
          </p>
          <p className="text-sm">
            <span className="font-medium">To:</span> {mzigo.receiver_town}
          </p>
        </div>
        <div className="space-y-2">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sender Phone:</span>
              <span>{mzigo.sender_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receiver Phone:</span>
              <span>{mzigo.receiver_phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value:</span>
              <span>{mzigo.parcel_value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{mzigo.amount_charged}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle:</span>
              <span>{mzigo.p_vehicle}</span>
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
