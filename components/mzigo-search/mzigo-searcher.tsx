"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export function MzigoSearcher() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    // TODO: Add API call to search Mzigos
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

      {searched && (
        <Empty>
          <EmptyHeader>
            <div className="text-4xl">🔍</div>
            <EmptyTitle>No Results</EmptyTitle>
            <EmptyDescription>No Mzigos found matching your search criteria.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
