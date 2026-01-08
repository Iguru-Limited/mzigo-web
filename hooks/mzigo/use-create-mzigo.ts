import { useSession } from "next-auth/react";
import { syncManager, saveOfflineMzigo, useOfflineStore, getReferenceData } from "@/lib/offline";
import type { PaymentMethod } from "@/types/reference/payment-methods";
import { generateOfflineReceipt } from "@/lib/offline/offline-receipt";
import type { CreateMzigoPayload, CreateMzigoResponse } from "@/types/operations/mzigo";

export function useCreateMzigo() {
  const { data: session } = useSession();
  const { isOnline, refreshPendingCount } = useOfflineStore();

  // Check if offline capability is enabled for this company (1 = enabled, 0 = disabled)
  const offlineEnabled = session?.company?.offline === 1;

  const createMzigo = async (payload: CreateMzigoPayload): Promise<CreateMzigoResponse> => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    // If offline and offline capability is disabled, reject the request
    if (!isOnline && !offlineEnabled) {
      throw new Error("OFFLINE_NOT_ALLOWED");
    }
    
    // Cache session-derived names for robust offline usage
    if (typeof window !== "undefined") {
      try {
        if (session.company?.name) {
          localStorage.setItem("companyName", session.company.name);
        }
        if (session.office?.name) {
          localStorage.setItem("officeName", session.office.name);
        }
      } catch (e) {
        // Ignore storage errors
        console.warn("Failed to cache session names", e);
      }
    }

    // Get session data for receipt with stronger guards
    const servedBy = session.user.name || "Agent";
    const cachedCompanyName = typeof window !== "undefined" ? localStorage.getItem("companyName") : null;
    const cachedOfficeName = typeof window !== "undefined" ? localStorage.getItem("officeName") : null;
    const companyName = session.company?.name || cachedCompanyName || "MZIGO";
    const officeName = session.office?.name || cachedOfficeName || "Nairobi";
    const receiptFormatJson = session.company?.receipt_format_json;

    // If offline, save locally and queue for sync
    if (!isOnline) {
      const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Increment offline receipt counter for sequential numbering
      const offlineCount = useOfflineStore.getState().incrementOfflineReceiptCount();
      
      // Resolve payment method name from cached reference data (if available)
      let resolvedPaymentModeName: string | undefined = payload.payment_mode_name;
      try {
        const methods = await getReferenceData<PaymentMethod>("payment-methods");
        const match = methods?.find((m) => String(m.id) === String(payload.payment_mode));
        resolvedPaymentModeName = match?.payment_method;
      } catch {}

      // Generate offline receipt with full data for printing
      const receiptData = generateOfflineReceipt({
        offlineId,
        payload,
        servedBy,
        companyName,
        officeName,
        receiptFormatJson,
        resolvedPaymentModeName,
        offlineReceiptCount: offlineCount,
      });
      
      try {
        // Save to IndexedDB (include receipt data for later retrieval)
        await saveOfflineMzigo(offlineId, {
          payload,
          receiptData,
        });
        
        // Add to sync queue
        await syncManager.addToQueue({
          type: "create",
          endpoint: "/api/mzigo",
          method: "POST",
          payload,
          maxRetries: 5,
        });

        await refreshPendingCount();
      } catch (storageError) {
        console.error("Failed to save offline mzigo to database:", storageError);
        // Still return success response to allow user to print receipt, but warn about storage issue
        console.warn("Offline storage may not be working properly. Please try again if sync fails.");
      }

      // Return response with full receipt data for immediate printing
      return {
        status: "pending",
        message: "mzigo saved offline and will sync when online",
        data: receiptData,
      };
    }

    // Online - make the request via proxy
    try {
      const response = await fetch("/api/mzigo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        
        // Resolve payment method name from cached reference data (if available)
        let resolvedPaymentModeName: string | undefined = payload.payment_mode_name;
        try {
          const methods = await getReferenceData<PaymentMethod>("payment-methods");
          const match = methods?.find((m) => String(m.id) === String(payload.payment_mode));
          resolvedPaymentModeName = match?.payment_method;
        } catch {}

        // Generate offline receipt with full data for printing
        const receiptData = generateOfflineReceipt({
          offlineId,
          payload,
          servedBy,
          companyName,
          officeName,
          receiptFormatJson,
          resolvedPaymentModeName,
        });
        
        try {
          // Save to IndexedDB (include receipt data)
          await saveOfflineMzigo(offlineId, {
            payload,
            receiptData,
          });
          
          await syncManager.addToQueue({
            type: "create",
            endpoint: "/api/mzigo",
            method: "POST",
            payload,
            maxRetries: 5,
          });

          await refreshPendingCount();
        } catch (storageError) {
          console.error("Failed to save offline fallback to database:", storageError);
          // Still return success response to allow user to print receipt
          console.warn("Offline storage may not be working properly.");
        }

        return {
          status: "pending",
          message: "mzigo saved offline and will sync when online",
          data: receiptData,
        };
      }

      console.error("Error creating mzigo:", error);
      throw error;
    }
  };

  return { 
    createMzigo, 
    isLoading: false, 
    isOffline: !isOnline,
    offlineEnabled,
  };
}
