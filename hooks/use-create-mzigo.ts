import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";
import { syncManager, saveOfflineShipment, useOfflineStore } from "@/lib/offline";
import { toast } from "sonner";

interface CreateMzigoPayload {
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_town: string;
  parcel_description: string;
  parcel_value: string | number;
  package_size: string;
  amount_charged: string | number;
  payment_mode: string;
  p_vehicle: string;
  receiver_route: string;
  commission: string | number;
  special_instructions: string;
}

interface CreateMzigoResponse {
  status: string;
  message: string;
  data?: {
    id: string;
    receipt_number: string;
    package_token: string;
    s_date: string;
    s_time: string;
  };
}

export function useCreateMzigo() {
  const { data: session } = useSession();
  const { isOnline, refreshPendingCount } = useOfflineStore();

  const createMzigo = async (payload: CreateMzigoPayload): Promise<CreateMzigoResponse> => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      throw new Error("Access token not available");
    }

    const apiUrl = getApiUrl(API_ENDPOINTS.CREATE_MZIGO);

    // If offline, save locally and queue for sync
    if (!isOnline) {
      const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save to IndexedDB
      await saveOfflineShipment(offlineId, payload);
      
      // Add to sync queue
      await syncManager.addToQueue({
        type: "create",
        endpoint: apiUrl,
        method: "POST",
        payload,
        maxRetries: 5,
      });

      await refreshPendingCount();

      toast.info("Saved offline", {
        description: "Your shipment will be created when you're back online.",
      });

      // Return a mock response for offline creation
      return {
        status: "pending",
        message: "Shipment saved offline and will sync when online",
        data: {
          id: offlineId,
          receipt_number: `OFFLINE-${offlineId.slice(-8).toUpperCase()}`,
          package_token: offlineId,
          s_date: new Date().toISOString().split("T")[0],
          s_time: new Date().toLocaleTimeString(),
        },
      };
    }

    // Online - make the request directly
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data: CreateMzigoResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create mzigo");
      }

      return data;
    } catch (error) {
      // If network error while supposedly online, save offline
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await saveOfflineShipment(offlineId, payload);
        
        await syncManager.addToQueue({
          type: "create",
          endpoint: apiUrl,
          method: "POST",
          payload,
          maxRetries: 5,
        });

        await refreshPendingCount();

        toast.warning("Connection lost", {
          description: "Your shipment was saved and will sync when online.",
        });

        return {
          status: "pending",
          message: "Shipment saved offline and will sync when online",
          data: {
            id: offlineId,
            receipt_number: `OFFLINE-${offlineId.slice(-8).toUpperCase()}`,
            package_token: offlineId,
            s_date: new Date().toISOString().split("T")[0],
            s_time: new Date().toLocaleTimeString(),
          },
        };
      }

      console.error("Error creating mzigo:", error);
      throw error;
    }
  };

  return { createMzigo, isLoading: false, isOffline: !isOnline };
}
