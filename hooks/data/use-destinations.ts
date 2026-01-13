"use client";

import type { Destination, DestinationListResponse } from "@/types/reference/destinations";
import { useOfflineData } from "@/hooks/offline/use-offline-data";
import type { UseDataListReturn } from "@/hooks/types";

/**
 * Hook to fetch and manage destinations list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useDestinations(routeId?: string): UseDataListReturn<Destination> {
  const shouldFetch = Boolean(routeId);
  const url = shouldFetch ? `/api/destinations?route=${encodeURIComponent(String(routeId))}` : null;

  const { data, error, isLoading, isOffline, refresh } = useOfflineData<Destination[]>(
    url,
    {
      cacheKey: `destinations:route:${routeId ?? "none"}`,
      referenceType: "destinations",
      transform: (response: unknown) => {
        const res = response as DestinationListResponse;
        if (res.status === "success" && res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to fetch destinations");
      },
    }
  );

  return {
    data: shouldFetch ? (data || []) : [],
    isLoading: shouldFetch ? isLoading : false,
    error: shouldFetch ? (error?.message || null) : null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
