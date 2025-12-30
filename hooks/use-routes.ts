"use client";

import { RouteItem, RouteListResponse } from "@/types/routes";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useOfflineData } from "@/hooks/use-offline-data";

interface UseRoutesReturn {
  routes: RouteItem[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage routes list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useRoutes(): UseRoutesReturn {
  const url = getApiUrl(API_ENDPOINTS.LIST_ROUTES);

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
    routes: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
