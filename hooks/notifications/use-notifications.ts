import useSWR from "swr";
import type { ListNotificationsResponse, NotificationItem } from "@/types";

interface UseNotificationsParams {
  type: "notified" | "unnotified";
  start_date: string;
  end_date: string;
  enabled?: boolean;
}

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useNotifications({
  type,
  start_date,
  end_date,
  enabled = true,
}: UseNotificationsParams): UseNotificationsReturn {
  const queryParams = new URLSearchParams({
    type,
    start_date,
    end_date,
  });

  const { data, error, isLoading, mutate } = useSWR<ListNotificationsResponse>(
    enabled ? `/api/notifications/list?${queryParams.toString()}` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    notifications: data?.data || [],
    error: error || null,
    isLoading,
    refresh: () => mutate(),
  };
}
