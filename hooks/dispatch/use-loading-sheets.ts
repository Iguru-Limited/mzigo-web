import useSWR from "swr";
import type { ListLoadingSheetsResponse, LoadingSheet } from "@/types";

interface UseLoadingSheetsParams {
  type?: "dispatched" | "undispatched";
}

interface UseLoadingSheetsReturn {
  sheets: LoadingSheet[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useLoadingSheets({ type }: UseLoadingSheetsParams = {}): UseLoadingSheetsReturn {
  const queryParam = type === "dispatched" ? "?type=dispatched" : "";
  const { data, error, isLoading, mutate } = useSWR<ListLoadingSheetsResponse>(
    `/api/dispatch/list${queryParam}`,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch loading sheets");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    sheets: data?.data || [],
    error: error || null,
    isLoading,
    refresh: () => mutate(),
  };
}
