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
import { toast } from "sonner";
import { useCollections } from "@/hooks/collections/use-collections";
import { useCreateCollection } from "@/hooks/collections/use-create-collection";
import { useSearchMzigo } from "@/hooks/mzigo";
import type { CollectionItem } from "@/types";
import type { SearchMzigoItem } from "@/types/operations/search-mzigo";

type TabType = "collected" | "to_collect";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): string {
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function CollectionManager() {
  const [activeTab, setActiveTab] = useState<TabType>("collected");
  const [startDate, setStartDate] = useState<string>(addDays(new Date(), -7)); // 7 days ago
  const [endDate, setEndDate] = useState<string>(today());
  const [displayCount, setDisplayCount] = useState(10);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state for creating collection
  const [selectedParcels, setSelectedParcels] = useState<SearchMzigoItem[]>([]);
  const [collectorName, setCollectorName] = useState<string>("");
  const [collectorPhone, setCollectorPhone] = useState<string>("");
  const [nationalId, setNationalId] = useState<string>("");
  const [collectorNotes, setCollectorNotes] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const { results: searchResults, isLoading: isSearching, error: searchError } = useSearchMzigo(activeQuery);

  // Fetch collections for both tabs
  const {
    collections: collectedCollections,
    isLoading: isLoadingCollected,
    error: errorCollected,
    refresh: refreshCollected,
  } = useCollections({
    start_date: startDate,
    end_date: endDate,
    is_collected: 1,
  });

  const {
    collections: toCollectCollections,
    isLoading: isLoadingToCollect,
    error: errorToCollect,
    refresh: refreshToCollect,
  } = useCollections({
    start_date: startDate,
    end_date: endDate,
    is_collected: 0,
  });

  const { createCollection } = useCreateCollection();

  // Get active collections based on tab
  const activeCollections =
    activeTab === "collected" ? collectedCollections : toCollectCollections;
  const isLoading = activeTab === "collected" ? isLoadingCollected : isLoadingToCollect;
  const error = activeTab === "collected" ? errorCollected : errorToCollect;

  // Pagination
  const displayedCollections = activeCollections.slice(0, displayCount);
  const hasMore = activeCollections.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setDisplayCount(10); // Reset pagination when switching tabs
  };

  const handleCreateCollection = async () => {
    if (selectedParcels.length === 0) {
      toast.error("Please select at least one parcel");
      return;
    }

    if (!collectorName || !collectorPhone || !nationalId || !collectorNotes) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsCreating(true);
      await createCollection({
        parcel_ids: selectedParcels.map((p) => p.id),
        collector_name: collectorName,
        collector_phone: collectorPhone,
        national_id: nationalId,
        collector_notes: collectorNotes,
      });
      toast.success("Collection created successfully");
      setShowCreateDialog(false);
      // Reset form
      setSelectedParcels([]);
      setCollectorName("");
      setCollectorPhone("");
      setNationalId("");
      setCollectorNotes("");
      setSearchQuery("");
      setActiveQuery(null);
      // Refresh data
      refreshCollected();
      refreshToCollect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create collection";
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
          <p className="text-sm text-muted-foreground">Manage and track Mzigo collections.</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>+ New Collection</Button>
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
                refreshCollected();
                refreshToCollect();
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
          onClick={() => handleTabChange("collected")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "collected"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Collected ({collectedCollections.length})
        </button>
        <button
          onClick={() => handleTabChange("to_collect")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "to_collect"
              ? "text-primary border-b-2 border-primary -mb-0.5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          To Collect ({toCollectCollections.length})
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
      ) : displayedCollections.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">📦</div>
            <EmptyTitle>
              {activeTab === "collected" ? "No Collected Parcels" : "No Parcels to Collect"}
            </EmptyTitle>
            <EmptyDescription>
              {activeTab === "collected"
                ? "No parcels have been collected in this date range."
                : "All parcels have been collected or there are none pending."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {displayedCollections.map((item) => (
            <CollectionCard key={item.id} item={item} />
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

      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
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
              <Label htmlFor="collector-name">
                Collector Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="collector-name"
                placeholder="e.g., John Doe"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collector-phone">
                Collector Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="collector-phone"
                placeholder="e.g., 0714593953"
                value={collectorPhone}
                onChange={(e) => setCollectorPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="national-id">
                National ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="national-id"
                placeholder="e.g., 12345678"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collector-notes">
                Collector Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="collector-notes"
                placeholder="e.g., Collected by brother"
                value={collectorNotes}
                onChange={(e) => setCollectorNotes(e.target.value)}
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
            <Button onClick={handleCreateCollection} disabled={isCreating}>
              {isCreating && <Spinner className="mr-2" />}
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollectionCard({ item }: { item: CollectionItem }) {
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
          </div>
        </div>

        {/* Collection Info */}
        <div className="space-y-2">
          <div className="bg-muted p-3 rounded-md space-y-2">
            <div className="text-sm">
              <p className="font-medium">Collector: {item.collector_name}</p>
              <p className="text-xs text-muted-foreground">{item.collector_phone}</p>
            </div>
            {item.collected_date && (
              <div className="text-sm">
                <p className="font-medium">
                  {new Date(item.collected_date).toLocaleDateString()} at {item.collected_time}
                </p>
                <p className="text-xs text-muted-foreground">Collected by: {item.collected_by_name}</p>
              </div>
            )}
            {item.collector_notes && (
              <p className="text-xs text-muted-foreground italic">&quot;{item.collector_notes}&quot;</p>
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
