import useSWR from "swr";
import type { ListDeliveriesResponse, DeliveryItem } from "@/types";

interface UseDeliveriesParams {
  type: "delivered" | "undelivered";
  start_date: string;
  end_date: string;
  enabled?: boolean;
}

interface UseDeliveriesReturn {
  deliveries: DeliveryItem[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useDeliveries({
  type,
  start_date,
  end_date,
  enabled = true,
}: UseDeliveriesParams): UseDeliveriesReturn {
  const queryParams = new URLSearchParams({
    type,
    start_date,
    end_date,
  });

  const { data, error, isLoading, mutate } = useSWR<ListDeliveriesResponse>(
    enabled ? `/api/delivery/list?${queryParams.toString()}` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    deliveries: data?.data || [],
    error: error || null,
    isLoading,
    refresh: () => mutate(),
  };
}
