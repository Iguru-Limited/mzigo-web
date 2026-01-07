import useSWR from "swr";
import type { ListParcelsResponse, MzigoParcel } from "@/types";

interface UseParcelsReturn {
  items: MzigoParcel[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useParcels(): UseParcelsReturn {
  const { data, error, isLoading, mutate } = useSWR<ListParcelsResponse>(
    "/api/duplicate/list",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch parcels");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    items: data?.data || [],
    error: error || null,
    isLoading,
    refresh: () => mutate(),
  };
}
