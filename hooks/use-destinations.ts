"use client";

import { Destination, DestinationListResponse } from "@/types/destinations";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useOfflineData } from "@/hooks/use-offline-data";

interface UseDestinationsReturn {
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage destinations list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useDestinations(): UseDestinationsReturn {
  const url = getApiUrl(API_ENDPOINTS.LIST_DESTINATION);

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
    destinations: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
