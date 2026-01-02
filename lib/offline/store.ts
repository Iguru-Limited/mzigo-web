import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSyncQueueCount } from "./db";

interface OfflineState {
  // Network status
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;

  // Sync status
  isSyncing: boolean;
  setIsSyncing: (isSyncing: boolean) => void;
  lastSyncTime: number | null;
  setLastSyncTime: (time: number) => void;

  // Pending operations count
  pendingCount: number;
  setPendingCount: (count: number) => void;
  refreshPendingCount: () => Promise<void>;

  // Sync errors
  syncErrors: Array<{ message: string; timestamp: number }>;
  addSyncError: (message: string) => void;
  clearSyncErrors: () => void;

  // Service worker status
  swRegistered: boolean;
  setSwRegistered: (registered: boolean) => void;

  // Offline receipt counter for sequential numbering
  offlineReceiptCount: number;
  incrementOfflineReceiptCount: () => number;
  resetOfflineReceiptCount: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      // Network status
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      setIsOnline: (isOnline) => set({ isOnline }),

      // Sync status
      isSyncing: false,
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      lastSyncTime: null,
      setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),

      // Pending operations
      pendingCount: 0,
      setPendingCount: (pendingCount) => set({ pendingCount }),
      refreshPendingCount: async () => {
        try {
          const count = await getSyncQueueCount();
          set({ pendingCount: count });
        } catch (error) {
          console.error("Failed to refresh pending count:", error);
        }
      },

      // Sync errors
      syncErrors: [],
      addSyncError: (message) =>
        set((state) => ({
          syncErrors: [
            ...state.syncErrors.slice(-9), // Keep last 10 errors
            { message, timestamp: Date.now() },
          ],
        })),
      clearSyncErrors: () => set({ syncErrors: [] }),

      // Service worker status
      swRegistered: false,
      setSwRegistered: (swRegistered) => set({ swRegistered }),

      // Offline receipt counter
      offlineReceiptCount: 0,
      incrementOfflineReceiptCount: () => {
        const newCount = (get().offlineReceiptCount || 0) + 1;
        set({ offlineReceiptCount: newCount });
        return newCount;
      },
      resetOfflineReceiptCount: () => set({ offlineReceiptCount: 0 }),
    }),
    {
      name: "mzigo-offline-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastSyncTime: state.lastSyncTime,
        syncErrors: state.syncErrors,
        offlineReceiptCount: state.offlineReceiptCount,
      }),
    }
  )
);

// Helper function to check if app should work offline
export function shouldUseOfflineData(): boolean {
  const { isOnline } = useOfflineStore.getState();
  return !isOnline;
}
