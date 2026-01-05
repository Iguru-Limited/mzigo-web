"use client";

import useSWR from "swr";
import type { 
  AttendantStatsResponse, 
  AttendantStatsData,
  AttendantStatsParams 
} from "@/types/operations/attendant-stats";

export function useAttendantStats(params: AttendantStatsParams | null) {
  // Build query string from params
  const key = params 
    ? `/api/mzigo/report?start_date=${params.start_date}&end_date=${params.end_date}`
    : null;

  const fetcher = async (url: string): Promise<AttendantStatsData> => {
    const res = await fetch(url, { 
      headers: { "Content-Type": "application/json" } 
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    
    const json: AttendantStatsResponse = await res.json();
    
    if (json.status !== "success" || !json.data) {
      throw new Error("Failed to fetch attendant stats");
    }
    
    return json.data;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<AttendantStatsData>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 2000,
    }
  );

  return {
    data,
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
