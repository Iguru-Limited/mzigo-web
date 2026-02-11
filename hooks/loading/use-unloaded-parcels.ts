"use client";

import useSWR from "swr";
import type { UnloadedParcel, UnloadedParcelListResponse } from "@/types/operations/loading";

export interface UseUnloadedParcelsParams {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
  destinationId: string | number | null;
}

export function useUnloadedParcels({ startDate, endDate, destinationId }: UseUnloadedParcelsParams) {
  const key = startDate && endDate && destinationId
    ? `/api/legacy-loading/list?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}&destination_id=${encodeURIComponent(String(destinationId))}`
    : null;

  const fetcher = async (url: string): Promise<UnloadedParcel[]> => {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    const json: UnloadedParcelListResponse = await res.json();
    if (json.status !== "success" || !Array.isArray(json.data)) {
      return [];
    }
    return json.data;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<UnloadedParcel[]>(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateOnMount: true,
    dedupingInterval: 1000,
  });

  return {
    items: data || [],
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
