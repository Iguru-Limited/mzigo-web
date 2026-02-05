import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import type { CreateNotificationResponse } from "@/types";

interface UseCreateNotificationReturn {
  createNotification: (parcelIds: (string | number)[]) => Promise<CreateNotificationResponse>;
  isLoading: boolean;
  error: Error | null;
}

export function useCreateNotification(): UseCreateNotificationReturn {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNotification = async (parcelIds: (string | number)[]): Promise<CreateNotificationResponse> => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    if (!parcelIds || parcelIds.length === 0) {
      throw new Error("At least one parcel must be selected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parcel_ids: parcelIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create notifications");
      }

      const data: CreateNotificationResponse = await response.json();
      
      // Refresh all notification lists after creating notifications
      mutate((key) => typeof key === "string" && key.startsWith("/api/notifications/list"));
      
      return data;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Unknown error");
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createNotification,
    isLoading,
    error,
  };
}
