"use client";

import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export function NotificationCenter() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Stay updated with the latest notifications about your mzigos.
      </p>
      <Empty>
        <EmptyHeader>
          <div className="text-4xl">🔔</div>
          <EmptyTitle>No Notifications</EmptyTitle>
          <EmptyDescription>You're all caught up! No new notifications.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
