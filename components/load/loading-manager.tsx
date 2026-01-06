"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { DestinationInput } from "@/components/ui/destination-input";
import { useDestinations } from "@/hooks/data/use-destinations";
import { useUnloadedParcels } from "@/hooks/loading/use-unloaded-parcels";

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

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected = items.length > 0 && selectedIds.size === items.length;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      <Card className="p-4">
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
            />
          </div>
        </div>
      </Card>

      <Separator />

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
  );
}
