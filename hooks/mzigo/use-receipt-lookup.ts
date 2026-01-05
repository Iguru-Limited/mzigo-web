"use client";

import useSWR from "swr";
import type { ReceiptData } from "@/types/operations/receipt";
import type { LookupResponse } from "@/types/operations/mzigo";

export function useReceiptLookup(packageToken: string | null) {
  const key = packageToken ? `/api/lookup?package_token=${encodeURIComponent(packageToken)}` : null;

  const fetcher = async (url: string): Promise<ReceiptData | null> => {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    const json: LookupResponse = await res.json();
    if (json.status !== "success" || json.count === 0 || !json.data?.length) {
      return null;
    }
    const r = json.data[0];
    return {
      id: r.id,
      receipt_number: r.receipt_number,
      package_token: r.package_token,
      s_date: r.s_date,
      s_time: r.s_time,
      receipt: r.receipt,
    };
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<ReceiptData | null>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    data,
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
