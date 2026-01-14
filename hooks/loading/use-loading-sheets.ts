"use client";

import useSWR from "swr";
import type { ListLoadingSheetsResponse } from "@/types";

interface UseLoadingSheetsParams {
  type?: "loaded";
  endDate?: string;
}

interface UseLoadingSheetsReturn {
  sheets: import("@/types").LoadingSheet[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useLoadingSheets({ type, endDate }: UseLoadingSheetsParams = {}): UseLoadingSheetsReturn {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (endDate) params.set("end_date", endDate);
  
  const queryString = params.toString();
  const url = `/api/loading-sheets${queryString ? `?${queryString}` : ""}`;
  
  const { data, error, isLoading, mutate } = useSWR<ListLoadingSheetsResponse>(
    // Use array key with parameters to ensure proper cache invalidation
    [url, type, endDate],
    async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch loading sheets");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 0, // No deduping to allow immediate refetch on date change
      keepPreviousData: false,
    }
  );

  return {
    sheets: data?.data || [],
    error: error || null,
    isLoading,
    refresh: () => mutate(),
  };
}
