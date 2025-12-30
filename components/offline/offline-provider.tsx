"use client";

import React, { useEffect } from "react";
import { SWRConfig } from "swr";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { useOfflineStore } from "@/lib/offline";
import { swrOfflineConfig } from "@/lib/swr-config";
import { toast } from "sonner";

interface OfflineProviderProps {
  children: React.ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { pendingCount, refreshPendingCount } = useOfflineStore();
  const { isRegistered, requestSync } = useServiceWorker();

  // Refresh pending count on mount
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Show toast when connection status changes
  useEffect(() => {
    if (!isOnline) {
      toast.warning("You're offline", {
        duration: 5000,
      });
    } else if (wasOffline) {
      toast.success("You're back online!", {
        description: pendingCount > 0 
          ? `Syncing ${pendingCount} pending operation${pendingCount > 1 ? 's' : ''}...`
          : "All data is up to date.",
        duration: 3000,
      });
      
      // Trigger sync when coming back online
      requestSync();
    }
  }, [isOnline, wasOffline, pendingCount, requestSync]);

  // Log service worker status
  useEffect(() => {
    if (isRegistered) {
      console.log("[Offline] Service worker registered, offline support active");
    }
  }, [isRegistered]);

  return (
    <SWRConfig value={swrOfflineConfig}>
      {children}
    </SWRConfig>
  );
}
