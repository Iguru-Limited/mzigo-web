"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOfflineStore } from "@/lib/offline";
import { WifiOff, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function OfflineIndicator({ 
  className, 
  showWhenOnline = false 
}: OfflineIndicatorProps) {
  const { isOnline } = useOnlineStatus();
  const { pendingCount, isSyncing } = useOfflineStore();

  // Don't show if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isOnline
          ? pendingCount > 0
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        className
      )}
    >
      {isOnline ? (
        isSyncing ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Syncing...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <Cloud className="h-3 w-3" />
            <span>{pendingCount} pending</span>
          </>
        ) : (
          <>
            <Cloud className="h-3 w-3" />
            <span>Online</span>
          </>
        )
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

interface OfflineBannerProps {
  className?: string;
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const { isOnline } = useOnlineStatus();
  const { pendingCount, isSyncing } = useOfflineStore();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full px-4 py-2 text-center text-sm font-medium transition-all",
        isOnline
          ? isSyncing
            ? "bg-blue-500 text-white"
            : "bg-yellow-500 text-white"
          : "bg-red-500 text-white",
        className
      )}
    >
      {isOnline ? (
        isSyncing ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Syncing your changes...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CloudOff className="h-4 w-4" />
            {pendingCount} change{pendingCount > 1 ? "s" : ""} waiting to sync
          </span>
        )
      ) : (
        <span className="flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          You&apos;re offline. Changes will sync when you reconnect.
        </span>
      )}
    </div>
  );
}
