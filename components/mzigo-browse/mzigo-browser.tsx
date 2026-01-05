"use client";

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export function MzigoBrowser() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Browse through all your Mzigos and track their status.
      </p>
      <Empty>
        <EmptyHeader>
          <div className="text-4xl">📦</div>
          <EmptyTitle>No Mzigos</EmptyTitle>
          <EmptyDescription>No Mzigos found. Create a new Mzigo to get started.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
