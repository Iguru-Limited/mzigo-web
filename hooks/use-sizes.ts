"use client";

import { Size, SizeListResponse } from "@/types/sizes";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useOfflineData } from "@/hooks/use-offline-data";

interface UseSizesReturn {
  sizes: Size[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage sizes list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useSizes(): UseSizesReturn {
  const url = getApiUrl(API_ENDPOINTS.LIST_SIZES);

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
    sizes: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
