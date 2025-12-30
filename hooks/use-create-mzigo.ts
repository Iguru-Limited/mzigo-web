import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";
import { syncManager, saveOfflineShipment, useOfflineStore } from "@/lib/offline";
import { generateOfflineReceipt } from "@/lib/offline/offline-receipt";
import { ReceiptData } from "@/types/receipt";
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
  data?: ReceiptData;
}

export function useCreateMzigo() {
  const { data: session } = useSession();
  const { isOnline, refreshPendingCount } = useOfflineStore();

  const createMzigo = async (payload: CreateMzigoPayload): Promise<CreateMzigoResponse> => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      throw new Error("Access token not available");
    }

    const apiUrl = getApiUrl(API_ENDPOINTS.CREATE_MZIGO);
    
    // Get session data for receipt
    const servedBy = session.user.name || "Agent";
    const companyName = session.company?.name || "MZIGO";
    const branchName = session.branch?.name || "Nairobi";

    // If offline, save locally and queue for sync
    if (!isOnline) {
      const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate offline receipt with full data for printing
      const receiptData = generateOfflineReceipt({
        offlineId,
        payload,
        servedBy,
        companyName,
        branchName,
      });
      
      // Save to IndexedDB (include receipt data for later retrieval)
      await saveOfflineShipment(offlineId, {
        payload,
        receiptData,
      });
      
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
        description: "Your shipment will be created when you're back online. You can print the receipt now.",
      });

      // Return response with full receipt data for immediate printing
      return {
        status: "pending",
        message: "Shipment saved offline and will sync when online",
        data: receiptData,
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
        
        // Generate offline receipt with full data for printing
        const receiptData = generateOfflineReceipt({
          offlineId,
          payload,
          servedBy,
          companyName,
          branchName,
        });
        
        // Save to IndexedDB (include receipt data)
        await saveOfflineShipment(offlineId, {
          payload,
          receiptData,
        });
        
        await syncManager.addToQueue({
          type: "create",
          endpoint: apiUrl,
          method: "POST",
          payload,
          maxRetries: 5,
        });

        await refreshPendingCount();

        toast.warning("Connection lost", {
          description: "Your shipment was saved and will sync when online. You can print the receipt now.",
        });

        return {
          status: "pending",
          message: "Shipment saved offline and will sync when online",
          data: receiptData,
        };
      }

      console.error("Error creating mzigo:", error);
      throw error;
    }
  };

  return { createMzigo, isLoading: false, isOffline: !isOnline };
}
