"use client";

import { PaymentMethod, PaymentMethodListResponse } from "@/types/payment-methods";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useOfflineData } from "@/hooks/use-offline-data";

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage payment methods list with offline support
 * Uses SWR for caching and IndexedDB for persistent offline storage
 */
export function usePaymentMethods(): UsePaymentMethodsReturn {
  const url = getApiUrl(API_ENDPOINTS.PAYMENT_METHODS);

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
    paymentMethods: data || [],
    isLoading,
    error: error?.message || null,
    isOffline,
    refetch: async () => { await refresh(); },
  };
}
