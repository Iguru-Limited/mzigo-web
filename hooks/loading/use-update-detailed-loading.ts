"use client";

import type { UpdateDetailedLoadingPayload, UpdateDetailedLoadingResponse } from "@/types/operations/loading";

export function useUpdateDetailedLoading() {
  const updateDetailedSheet = async (payload: UpdateDetailedLoadingPayload) => {
    const res = await fetch("/api/detailed-loading/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json: UpdateDetailedLoadingResponse = await res.json();

    if (json.status !== "success") {
      throw new Error(json.message || "Failed to update detailed loading sheet");
    }

    return json.data;
  };

  return { updateDetailedSheet };
}
