"use client";

import { useState, useEffect } from "react";
import { Destination, DestinationListResponse } from "@/types/destinations";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useSession } from "next-auth/react";

interface UseDestinationsReturn {
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage destinations list
 * Used for selecting destinations in the shipment form
 */
export function useDestinations(): UseDestinationsReturn {
  const { data: session } = useSession();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = async () => {
    if (!session?.user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = getApiUrl(API_ENDPOINTS.LIST_DESTINATION);
      const accessToken = (session as any)?.accessToken;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch destinations: ${response.statusText}`);
      }

      const data: DestinationListResponse = await response.json();

      if (data.status === "success" && data.data) {
        setDestinations(data.data);
      } else {
        setError(data.message || "Failed to fetch destinations");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching destinations";
      setError(errorMessage);
      console.error("Error fetching destinations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDestinations();
    }
  }, [session]);

  return {
    destinations,
    isLoading,
    error,
    refetch: fetchDestinations,
  };
}
