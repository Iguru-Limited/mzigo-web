"use client";

import type { RouteItem, RouteListResponse } from "@/types/reference/routes";
import { useOfflineData } from "@/hooks/offline/use-offline-data";
import type { UseDataListReturn } from "@/hooks/types";

/**
 * Hook to fetch and manage routes list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useRoutes(): UseDataListReturn<RouteItem> {
  const url = "/api/routes";

  const { data, error, isLoading, isOffline, refresh } = useOfflineData<RouteItem[]>(
    url,
    {
      cacheKey: "routes",
      referenceType: "routes",
      transform: (response: unknown) => {
        const res = response as RouteListResponse;
        if (res.status === "success" && res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to fetch routes");
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
