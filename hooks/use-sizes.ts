"use client";

import { useState, useEffect } from "react";
import { Size, SizeListResponse } from "@/types/sizes";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useSession } from "next-auth/react";

interface UseSizesReturn {
  sizes: Size[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSizes(): UseSizesReturn {
  const { data: session } = useSession();
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSizes = async () => {
    if (!session?.user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = getApiUrl(API_ENDPOINTS.LIST_SIZES);
      const accessToken = (session as any)?.accessToken;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sizes: ${response.statusText}`);
      }

      const data: SizeListResponse = await response.json();

      if (data.status === "success" && data.data) {
        setSizes(data.data);
      } else {
        setError(data.message || "Failed to fetch sizes");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching sizes";
      setError(errorMessage);
      console.error("Error fetching sizes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSizes();
    }
  }, [session]);

  return { sizes, isLoading, error, refetch: fetchSizes };
}
