"use client";

import { useState, useEffect } from "react";
import { RouteItem, RouteListResponse } from "@/types/routes";
import { API_ENDPOINTS, getApiUrl } from "@/lib/constants";
import { useSession } from "next-auth/react";

interface UseRoutesReturn {
  routes: RouteItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRoutes(): UseRoutesReturn {
  const { data: session } = useSession();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    if (!session?.user) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = getApiUrl(API_ENDPOINTS.LIST_ROUTES);
      const accessToken = (session as any)?.accessToken;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }

      const data: RouteListResponse = await response.json();

      if (data.status === "success" && data.data) {
        setRoutes(data.data);
      } else {
        setError(data.message || "Failed to fetch routes");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching routes";
      setError(errorMessage);
      console.error("Error fetching routes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchRoutes();
    }
  }, [session]);

  return { routes, isLoading, error, refetch: fetchRoutes };
}
