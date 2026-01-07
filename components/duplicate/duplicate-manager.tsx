"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";

export function DuplicateManager() {
  const [waybillNumber, setWaybillNumber] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!waybillNumber.trim()) {
      alert("Please enter a waybill number");
      return;
    }
    setIsSearching(true);
    // TODO: Implement search and reprint logic
    setTimeout(() => {
      setIsSearching(false);
      alert("Reprint functionality coming soon");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Duplicate Receipt</h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Waybill Number
            </label>
            <Input
              type="text"
              placeholder="Enter waybill number"
              value={waybillNumber}
              onChange={(e) => setWaybillNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !waybillNumber.trim()}
            className="w-full md:w-auto"
          >
            {isSearching ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Searching...
              </>
            ) : (
              "Search & Reprint"
            )}
          </Button>
        </div>
      </Card>

      <Separator />

      <Empty>
        <EmptyHeader>
          <div className="text-4xl">📄</div>
          <EmptyTitle>Enter a Waybill Number</EmptyTitle>
          <EmptyDescription>
            Search for a receipt to duplicate and print.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
