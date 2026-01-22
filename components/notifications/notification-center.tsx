"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNotifications, useCreateNotification } from "@/hooks/notifications";
import type { NotificationItem } from "@/types";

type TabType = "notified" | "unnotified";

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): string {
  const newDate = new Date(date.getTime());
  newDate.setDate(newDate.getDate() + days);
  return newDate.toISOString().slice(0, 10);
}

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<TabType>("unnotified");
  const [startDate, setStartDate] = useState<string>(addDays(new Date(), -30)); // 30 days ago
  const [endDate, setEndDate] = useState<string>(today());
  const [displayCount, setDisplayCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedParcels, setSelectedParcels] = useState<Set<string>>(new Set());
  const [searchQueryCreate, setSearchQueryCreate] = useState<string>("");
  const [createDialogStartDate, setCreateDialogStartDate] = useState<string>(addDays(new Date(), -30));
  const [createDialogEndDate, setCreateDialogEndDate] = useState<string>(today());

  // Fetch notifications for both tabs
  const {
    notifications: notifiedNotifications,
    isLoading: isLoadingNotified,
    error: errorNotified,
    refresh: refreshNotified,
  } = useNotifications({
    type: "notified",
    start_date: startDate,
    end_date: endDate,
  });

  const {
    notifications: unnotifiedNotifications,
    isLoading: isLoadingUnnotified,
    error: errorUnnotified,
    refresh: refreshUnnotified,
  } = useNotifications({
    type: "unnotified",
    start_date: startDate,
    end_date: endDate,
  });

  const { createNotification, isLoading: isCreating } = useCreateNotification();

  // Get active notifications based on tab
  const activeNotifications =
    activeTab === "notified" ? notifiedNotifications : unnotifiedNotifications;
  const isLoading = activeTab === "notified" ? isLoadingNotified : isLoadingUnnotified;
  const error = activeTab === "notified" ? errorNotified : errorUnnotified;

  // Filter based on search query
  const filteredNotifications = activeNotifications.filter(
    (notification) =>
      notification.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.receiver_phone.includes(searchQuery) ||
      notification.sender_phone.includes(searchQuery)
  );

  // Filter for create dialog search
  const filteredUnnotified = unnotifiedNotifications.filter(
    (notification) =>
      (notification.s_date >= createDialogStartDate && notification.s_date <= createDialogEndDate) &&
      (notification.receipt_number.toLowerCase().includes(searchQueryCreate.toLowerCase()) ||
      notification.sender_name.toLowerCase().includes(searchQueryCreate.toLowerCase()) ||
      notification.receiver_name.toLowerCase().includes(searchQueryCreate.toLowerCase()) ||
      notification.receiver_phone.includes(searchQueryCreate) ||
      notification.sender_phone.includes(searchQueryCreate))
  );

  // Pagination
  const displayedNotifications = filteredNotifications.slice(0, displayCount);
  const hasMore = filteredNotifications.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  const handleToggleParcel = (parcelId: string) => {
    const newSelected = new Set(selectedParcels);
    if (newSelected.has(parcelId)) {
      newSelected.delete(parcelId);
    } else {
      newSelected.add(parcelId);
    }
    setSelectedParcels(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedParcels.size === filteredUnnotified.length) {
      setSelectedParcels(new Set());
    } else {
      setSelectedParcels(new Set(filteredUnnotified.map((p) => p.id)));
    }
  };

  const handleCreateNotifications = async () => {
    if (selectedParcels.size === 0) {
      toast.error("Please select at least one parcel");
      return;
    }

    try {
      const result = await createNotification(Array.from(selectedParcels));

      if (result.status === "success") {
        toast.success("Notifications created", {
          description: `Sent: ${result.data.sent}, Failed: ${result.data.failed}, Total: ${result.data.total}`,
        });
        setShowCreateDialog(false);
        setSelectedParcels(new Set());
        setSearchQueryCreate("");
        refreshUnnotified();
      } else {
        toast.error("Failed to create notifications", {
          description: result.message,
        });
      }
    } catch (err) {
      toast.error("Error creating notifications", {
        description: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Notifications
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => {
            setActiveTab("unnotified");
            setDisplayCount(10);
            setSearchQuery("");
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "unnotified"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending ({unnotifiedNotifications.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("notified");
            setDisplayCount(10);
            setSearchQuery("");
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "notified"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Notified ({notifiedNotifications.length})
        </button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDisplayCount(10);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDisplayCount(10);
                }}
              />
            </div>
          </div>
          {filteredNotifications.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Found {filteredNotifications.length} notification
              {filteredNotifications.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </Card>

      <Separator />

      {/* Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Loading notifications…</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading notifications</p>
          <p className="text-sm">{error.message}</p>
          <Button size="sm" variant="outline" onClick={() => 
            activeTab === "notified" ? refreshNotified() : refreshUnnotified()
          } className="mt-2">
            Retry
          </Button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">📬</div>
            <EmptyTitle>
              {searchQuery ? "No Notifications Found" : "No Notifications"}
            </EmptyTitle>
            <EmptyDescription>
              {activeTab === "notified"
                ? "No notified parcels in this period"
                : "No pending notifications"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="grid gap-4">
            {displayedNotifications.map((notification) => (
              <Card key={notification.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{notification.receipt_number}</p>
                      <p className="text-xs text-muted-foreground">{notification.s_date}</p>
                    </div>
                    {notification.is_notified === "1" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Notified
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {notification.parcel_description && (
                    <p className="text-sm text-muted-foreground">
                      {notification.parcel_description}
                    </p>
                  )}

                  {/* Sender & Receiver */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="font-medium text-green-900">From</p>
                      <p className="font-semibold">{notification.sender_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.sender_phone}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-medium text-blue-900">To</p>
                      <p className="font-semibold">{notification.receiver_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.receiver_phone}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-muted/50 p-2 rounded">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">KES {notification.amount_charged}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold">{notification.receiver_town_name || notification.receiver_town}</p>
                    </div>
                    {notification.is_notified === "1" && (
                      <div>
                        <p className="text-muted-foreground">Notified</p>
                        <p className="font-semibold">
                          {notification.notify_date} {notification.notify_time}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More ({displayCount} / {filteredNotifications.length})
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Notifications Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Notifications</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={createDialogStartDate}
                  onChange={(e) => {
                    setCreateDialogStartDate(e.target.value);
                    setSelectedParcels(new Set());
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={createDialogEndDate}
                  onChange={(e) => {
                    setCreateDialogEndDate(e.target.value);
                    setSelectedParcels(new Set());
                  }}
                />
              </div>
            </div>

            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Unnotified Parcels</label>
              <Input
                type="text"
                placeholder="Search by waybill, name, or phone..."
                value={searchQueryCreate}
                onChange={(e) => setSearchQueryCreate(e.target.value)}
              />
            </div>

            {/* Select All */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedParcels.size === filteredUnnotified.length && filteredUnnotified.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({selectedParcels.size}/{filteredUnnotified.length})
              </label>
            </div>

            {/* Parcels List */}
            <div className="border rounded-lg max-h-[400px] overflow-y-auto space-y-2 p-3">
              {filteredUnnotified.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No unnotified parcels found
                </p>
              ) : (
                filteredUnnotified.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="flex items-start gap-3 p-3 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`parcel-${parcel.id}`}
                      checked={selectedParcels.has(parcel.id)}
                      onChange={() => handleToggleParcel(parcel.id)}
                      className="w-4 h-4 cursor-pointer mt-1"
                    />
                    <label
                      htmlFor={`parcel-${parcel.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-medium text-sm">{parcel.receipt_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.sender_name} → {parcel.receiver_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parcel.receiver_phone} | KES {parcel.amount_charged}
                      </p>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setSelectedParcels(new Set());
                setSearchQueryCreate("");
                setCreateDialogStartDate(addDays(new Date(), -30));
                setCreateDialogEndDate(today());
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNotifications}
              disabled={isCreating || selectedParcels.size === 0}
            >
              {isCreating ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                `Send Notifications (${selectedParcels.size})`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
