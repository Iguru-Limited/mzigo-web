"use client";

import type { Destination, DestinationListResponse } from "@/types/reference/destinations";
import { useOfflineData } from "@/hooks/offline/use-offline-data";
import type { UseDataListReturn } from "@/hooks/types";

/**
 * Hook to fetch and manage destinations list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useDestinations(): UseDataListReturn<Destination> {
  const url = "/api/destinations";

  const { data, error, isLoading, isOffline, refresh } = useOfflineData<Destination[]>(
    url,
    {
      cacheKey: "destinations",
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
    data: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
