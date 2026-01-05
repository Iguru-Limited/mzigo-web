"use client";

import useSWR from "swr";
import type { SearchMzigoItem, SearchMzigoResponse } from "@/types/operations/search-mzigo";

export function useSearchMzigo(searchQuery: string | null) {
  const key = searchQuery ? `/api/mzigo/search?q=${encodeURIComponent(searchQuery)}` : null;

  const fetcher = async (url: string): Promise<SearchMzigoItem[]> => {
    const res = await fetch(url, { 
      headers: { "Content-Type": "application/json" } 
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    
    const json: SearchMzigoResponse = await res.json();
    
    if (json.status !== "success" || !Array.isArray(json.data)) {
      return [];
    }
    
    return json.data;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<SearchMzigoItem[]>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 1000, // Deduplicate requests within 1 second
    }
  );

  return {
    results: data || [],
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
