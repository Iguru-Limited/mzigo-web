"use client";

import { Vehicle, VehicleListResponse } from "@/types/vehicles";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useOfflineData } from "@/hooks/use-offline-data";

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage vehicles list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function useVehicles(): UseVehiclesReturn {
  const url = getApiUrl(API_ENDPOINTS.LIST_VEHICLES);

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
    vehicles: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
