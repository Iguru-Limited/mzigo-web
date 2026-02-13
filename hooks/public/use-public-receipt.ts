import useSWR from "swr";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants";
import type { PublicReceiptResponse } from "@/types/operations/public-receipt";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch receipt");
  }
  return response.json();
};

export function usePublicReceipt(token: string | null) {
  const { data, error, isLoading } = useSWR<PublicReceiptResponse>(
    token ? `/api/public/receipt?token=${encodeURIComponent(token)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    receipt: data?.data,
    isLoading,
    error: error ? { message: error?.message || "Failed to load receipt" } : null,
  };
}
