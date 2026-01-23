"use client";

import useSWR from "swr";
import type { ExpressMzigoItem, ExpressMzigoResponse } from "@/types/operations/express";

export function useExpressMzigo(query: string | null) {
  const key = query ? `/api/express-mzigo?q=${encodeURIComponent(query)}` : null;

  const fetcher = async (url: string): Promise<ExpressMzigoItem[]> => {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json: ExpressMzigoResponse = await res.json();

    if (json.status !== "success" || !Array.isArray(json.data)) {
      return [];
    }

    return json.data;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<ExpressMzigoItem[]>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 1000,
    }
  );

  return {
    results: data || [],
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
