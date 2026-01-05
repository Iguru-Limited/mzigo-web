"use client";

import type { Vehicle, VehicleListResponse } from "@/types/reference/vehicles";
import { useOfflineData } from "@/hooks/offline/use-offline-data";
import type { UseDataListReturn } from "@/hooks/types";

/**
 * Hook to fetch and manage vehicles list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useVehicles(): UseDataListReturn<Vehicle> {
  const url = "/api/vehicles";

  const { data, error, isLoading, isOffline, refresh } = useOfflineData<Vehicle[]>(
    url,
    {
      cacheKey: "vehicles",
      referenceType: "vehicles",
      transform: (response: unknown) => {
        const res = response as VehicleListResponse;
        if (res.status === "success" && res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to fetch vehicles");
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
