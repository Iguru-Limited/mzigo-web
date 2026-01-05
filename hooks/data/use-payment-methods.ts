"use client";

import type { PaymentMethod, PaymentMethodListResponse } from "@/types/reference/payment-methods";
import { useOfflineData } from "@/hooks/offline/use-offline-data";
import type { UseDataListReturn } from "@/hooks/types";

/**
 * Hook to fetch and manage payment methods list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function usePaymentMethods(): UseDataListReturn<PaymentMethod> {
  const url = "/api/payment-methods";

  const { data, error, isLoading, isOffline, refresh } = useOfflineData<PaymentMethod[]>(
    url,
    {
      cacheKey: "payment-methods",
      referenceType: "payment-methods",
      transform: (response: unknown) => {
        const res = response as PaymentMethodListResponse;
        if (res.status === "success" && res.data) {
          return res.data;
        }
        throw new Error(res.message || "Failed to fetch payment methods");
      },
    }
  );

  return {
    data: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
