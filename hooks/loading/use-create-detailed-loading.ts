"use client";

import type { CreateDetailedLoadingPayload, CreateDetailedLoadingResponse } from "@/types/operations/loading";

export function useCreateDetailedLoading() {
  const createDetailedSheet = async (payload: CreateDetailedLoadingPayload) => {
    const res = await fetch("/api/detailed-loading/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json: CreateDetailedLoadingResponse = await res.json();

    if (json.status !== "success") {
      throw new Error(json.message || "Failed to create detailed loading sheet");
    }

    return json.data;
  };

  return { createDetailedSheet };
}
