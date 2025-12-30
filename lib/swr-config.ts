import { SWRConfiguration } from "swr";
import { getCache, setCache } from "./offline";

// Custom fetcher with offline support
export async function offlineFetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `swr:${url}`;

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache successful responses
    await setCache(cacheKey, data);
    
    return data;
  } catch (error) {
    // If network error, try to get from cache
    if (!navigator.onLine || (error instanceof TypeError && error.message === "Failed to fetch")) {
      const cached = await getCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    throw error;
  }
}

// Fetcher with auth token
export function createAuthFetcher(getAccessToken: () => string | null | undefined) {
  return async function authFetcher<T>(url: string): Promise<T> {
    const accessToken = getAccessToken();
    
    return offlineFetcher<T>(url, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });
  };
}

// SWR configuration for offline-first strategy
export const swrOfflineConfig: SWRConfiguration = {
  // Keep data when error occurs
  keepPreviousData: true,
  
  // Revalidation settings
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  
  // Error retry with exponential backoff
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Dedupe interval
  dedupingInterval: 2000,
  
  // Custom error retry handler
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry on 4xx errors
    if (error.status >= 400 && error.status < 500) return;
    
    // Don't retry if offline
    if (!navigator.onLine) return;
    
    // Only retry up to 3 times
    if (retryCount >= 3) return;
    
    // Exponential backoff
    setTimeout(() => revalidate({ retryCount }), 5000 * Math.pow(2, retryCount));
  },
  
  // Use cached data as fallback
  fallbackData: undefined,
  
  // Load cached data on mount
  onLoadingSlow: (key) => {
    console.log(`SWR: Slow loading for ${key}`);
  },
};

// Provider configuration for SWRConfig
export function getSWRProviderConfig() {
  return {
    ...swrOfflineConfig,
    provider: () => new Map(),
  };
}
