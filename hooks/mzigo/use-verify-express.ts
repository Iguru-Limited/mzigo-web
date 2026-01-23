"use client";

import { useState } from "react";
import type { VerifyExpressPayload, VerifyExpressResponse } from "@/types/operations/verify-express";

export function useVerifyExpress() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (payload: VerifyExpressPayload): Promise<VerifyExpressResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/express-mzigo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: VerifyExpressResponse = await res.json();

      if (!res.ok || data.status === "error") {
        const errorMsg = data.message || "Failed to verify package";
        setError(errorMsg);
        return data;
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { verify, isLoading, error, setError };
}
