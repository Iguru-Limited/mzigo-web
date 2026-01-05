"use client";

import useSWR from "swr";
import type { 
  BrowseMzigoItem, 
  BrowseMzigoResponse, 
  BrowseMzigoParams 
} from "@/types/operations/browse-mzigo";

export function useBrowseMzigo(params: BrowseMzigoParams | null) {
  // Build query string from params
  const key = params 
    ? `/api/mzigo/browse?type=${params.type}&start_date=${params.start_date}&end_date=${params.end_date}${params.destination_id ? `&destination_id=${params.destination_id}` : ""}`
    : null;

  const fetcher = async (url: string): Promise<BrowseMzigoResponse> => {
    const res = await fetch(url, { 
      headers: { "Content-Type": "application/json" } 
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    
    const json: BrowseMzigoResponse = await res.json();
    
    if (json.status !== "success") {
      throw new Error("Failed to fetch browse data");
    }
    
    return json;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<BrowseMzigoResponse>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 2000, // Deduplicate requests within 2 seconds
    }
  );

  return {
    data: data?.data || [],
    count: data?.count || 0,
    dateRange: data?.date_range,
    type: data?.type,
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
