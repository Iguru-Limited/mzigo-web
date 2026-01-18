import useSWR from "swr";
import type { ListCollectionsResponse, CollectionItem } from "@/types";

interface UseCollectionsParams {
  start_date: string;
  end_date: string;
  is_collected: 0 | 1;
  enabled?: boolean;
}

interface UseCollectionsReturn {
  collections: CollectionItem[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useCollections({
  start_date,
  end_date,
  is_collected,
  enabled = true,
}: UseCollectionsParams): UseCollectionsReturn {
  const queryParams = new URLSearchParams({
    start_date,
    end_date,
    is_collected: is_collected.toString(),
  });

  const { data, error, isLoading, mutate } = useSWR<ListCollectionsResponse>(
    enabled ? `/api/collections/list?${queryParams.toString()}` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    collections: data?.data || [],
    error: error || null,
    isLoading,
    refresh: () => mutate(),
  };
}
