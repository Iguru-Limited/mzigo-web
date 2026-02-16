"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { Attendant, AttendantListResponse } from "@/types/operations/attendants";

export function useAttendants() {
  const { data: session } = useSession();
  const stageId = session?.office?.id;

  const key = stageId ? `/api/attendants?stage_id=${encodeURIComponent(stageId)}` : null;

  const fetcher = async (url: string): Promise<Attendant[]> => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json: AttendantListResponse = await res.json();

    if (json.status !== "success" || !Array.isArray(json.data)) {
      throw new Error("Failed to fetch attendants");
    }

    return json.data;
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<Attendant[]>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 2000,
    }
  );

  return {
    data: data || [],
    error: error as Error | undefined,
    isLoading,
    isValidating,
    refresh: () => mutate(),
  };
}
