import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";
import { toast } from "sonner";
import type { NotifyParcelResponse } from "@/types";

interface UseNotifyParcelParams {
  parcelId: string;
  method?: string;
}

interface UseNotifyParcelReturn {
  notifyParcel: (params: UseNotifyParcelParams) => Promise<NotifyParcelResponse>;
  isLoading: boolean;
  error: Error | null;
}

export function useNotifyParcel(): UseNotifyParcelReturn {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const notifyParcel = async ({ parcelId, method = "sms" }: UseNotifyParcelParams): Promise<NotifyParcelResponse> => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = getApiUrl(API_ENDPOINTS.LIST_NOTIFICATION);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).accessToken}`,
        },
        body: JSON.stringify({
          parcel_id: parcelId,
          notification_method: method,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to notify parcel");
      }

      const data: NotifyParcelResponse = await response.json();
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
    notifyParcel,
    isLoading,
    error,
  };
}
