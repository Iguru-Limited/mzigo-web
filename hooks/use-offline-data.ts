"use client";

import useSWR, { SWRConfiguration } from "swr";
import { useSession } from "next-auth/react";
import { getCache, setCache, setReferenceData, getReferenceData } from "@/lib/offline";
import { useOfflineStore } from "@/lib/offline";
import { useCallback, useEffect } from "react";

interface UseOfflineDataOptions<T> extends SWRConfiguration {
  // Cache key for IndexedDB
  cacheKey: string;
  // Reference data type (if applicable)
  referenceType?: "destinations" | "routes" | "vehicles" | "sizes" | "payment-methods";
  // Transform response data
  transform?: (data: unknown) => T;
  // Cache TTL in ms (default 24 hours)
  cacheTTL?: number;
}

/**
 * Generic hook for fetching data with offline support
 * Uses SWR for caching and revalidation, with IndexedDB as persistent fallback
 */
export function useOfflineData<T>(
  url: string | null,
  options: UseOfflineDataOptions<T>
) {
  const { data: session } = useSession();
  const { isOnline } = useOfflineStore();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const {
    cacheKey,
    referenceType,
    transform,
    cacheTTL = 24 * 60 * 60 * 1000,
    ...swrOptions
  } = options;

  // Fetcher with auth and caching
  const fetcher = useCallback(
    async (fetchUrl: string) => {
      // Try to fetch from network
      try {
        const response = await fetch(fetchUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        const data = transform ? transform(json) : json;

        // Cache the successful response
        await setCache(cacheKey, data, cacheTTL);

        // If it's reference data, also store in reference store
        if (referenceType && Array.isArray(data)) {
          await setReferenceData(referenceType, data);
        }

        return data as T;
      } catch (error) {
        // If offline or network error, try to get from cache
        if (!navigator.onLine) {
          // Try reference data first if applicable
          if (referenceType) {
            const refData = await getReferenceData<T>(referenceType);
            if (refData) return refData as T;
          }

          // Fall back to general cache
          const cached = await getCache<T>(cacheKey);
          if (cached) return cached;
        }

        throw error;
      }
    },
    [accessToken, cacheKey, referenceType, transform, cacheTTL]
  );

  // Load initial data from cache
  const getInitialData = useCallback(async (): Promise<T | undefined> => {
    if (referenceType) {
      const refData = await getReferenceData<T>(referenceType);
      if (refData) return refData as T;
    }
    const cached = await getCache<T>(cacheKey);
    return cached ?? undefined;
  }, [cacheKey, referenceType]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    url && accessToken ? url : null,
    fetcher,
    {
      revalidateOnFocus: isOnline,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      dedupingInterval: 5000,
      errorRetryCount: isOnline ? 3 : 0,
      ...swrOptions,
    }
  );

  // Load cached data on mount if no data
  useEffect(() => {
    if (!data && !isLoading) {
      getInitialData().then((cachedData) => {
        if (cachedData) {
          mutate(cachedData, false);
        }
      });
    }
  }, [data, isLoading, getInitialData, mutate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    isOffline: !isOnline,
    mutate,
    refresh: () => mutate(),
  };
}
