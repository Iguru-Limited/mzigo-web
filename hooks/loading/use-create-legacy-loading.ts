"use client";

import useSWR from "swr";
import type { CreateLegacyLoadingPayload, CreateLegacyLoadingResponse } from "@/types/operations/loading";

export function useCreateLegacyLoading() {
  const createLoadingSheet = async (payload: CreateLegacyLoadingPayload) => {
    const res = await fetch("/api/legacy-loading/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json: CreateLegacyLoadingResponse = await res.json();

    if (json.status !== "success") {
      throw new Error(json.message || "Failed to create loading sheet");
    }

    return json.data;
  };

  return { createLoadingSheet };
}
