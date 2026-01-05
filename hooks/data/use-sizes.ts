"use client";

import type { Size, SizeListResponse } from "@/types/reference/sizes";
import { useOfflineData } from "@/hooks/offline/use-offline-data";
import type { UseDataListReturn } from "@/hooks/types";

/**
 * Hook to fetch and manage sizes list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useSizes(): UseDataListReturn<Size> {
  const url = "/api/sizes";

  const { data, error, isLoading, isOffline, refresh } = useOfflineData<Size[]>(
    url,
    {
      cacheKey: "sizes",
      referenceType: "sizes",
      transform: (response: unknown) => {
        const res = response as SizeListResponse;
        if (res.status === "success" && res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to fetch sizes");
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
