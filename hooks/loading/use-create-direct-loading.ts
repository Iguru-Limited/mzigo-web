"use client";

import type { CreateDirectLoadingPayload, CreateDirectLoadingResponse } from "@/types/operations/loading";

export function useCreateDirectLoading() {
  const createLoadingSheet = async (payload: CreateDirectLoadingPayload) => {
    const res = await fetch("/api/direct-loading/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const json: CreateDirectLoadingResponse = await res.json();

    if (json.status !== "success") {
      throw new Error(json.message || "Failed to create loading sheet");
    }

    return json.data;
  };

  return { createLoadingSheet };
}
