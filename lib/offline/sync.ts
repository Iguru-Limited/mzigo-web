import {
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueItem,
  addToSyncQueue,
} from "./db";
import { useOfflineStore } from "./store";
import type { SyncOptions, SyncQueueItem } from "@/types/operations/offline";

class SyncManager {
  private isSyncing = false;
  private options: SyncOptions | null = null;

  configure(options: SyncOptions) {
    this.options = options;
  }

  async addToQueue(
    item: Omit<SyncQueueItem, "id" | "timestamp" | "retries" | "maxRetries"> & {
      maxRetries?: number;
    }
  ) {
    await addToSyncQueue({
      ...item,
      maxRetries: item.maxRetries ?? 3,
    });
    
    // Update pending count in store
    useOfflineStore.getState().refreshPendingCount();

    // Try to sync immediately if online
    if (useOfflineStore.getState().isOnline) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isSyncing || !this.options) return;
    if (!useOfflineStore.getState().isOnline) return;

    this.isSyncing = true;
    useOfflineStore.getState().setIsSyncing(true);

    try {
      const queue = await getSyncQueue();

      for (const item of queue) {
        try {
          const accessToken = await this.options.getAccessToken();
          if (!accessToken) {
            throw new Error("No access token available");
          }

          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: item.payload ? JSON.stringify(item.payload) : undefined,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Success - remove from queue
          if (item.id) {
            await removeFromSyncQueue(item.id);
          }
          
          this.options.onItemSynced?.(item);
        } catch (error) {
          console.error("Sync item failed:", error);
          
          // Increment retry count
          item.retries += 1;
          
          if (item.retries >= item.maxRetries) {
            // Max retries reached, remove from queue and report error
            if (item.id) {
              await removeFromSyncQueue(item.id);
            }
            useOfflineStore.getState().addSyncError(
              `Failed to sync after ${item.maxRetries} attempts: ${item.endpoint}`
            );
          } else {
            // Update retry count
            await updateSyncQueueItem(item);
          }
        }
      }

      useOfflineStore.getState().setLastSyncTime(Date.now());
      this.options.onSyncComplete?.();
    } catch (error) {
      console.error("Sync queue processing failed:", error);
      this.options.onSyncError?.(error as Error);
    } finally {
      this.isSyncing = false;
      useOfflineStore.getState().setIsSyncing(false);
      useOfflineStore.getState().refreshPendingCount();
    }
  }

  // Force sync attempt
  async forceSync() {
    if (useOfflineStore.getState().isOnline) {
      await this.processQueue();
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager();

// Setup automatic sync on online event
export function setupAutoSync(options: SyncOptions) {
  syncManager.configure(options);

  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      useOfflineStore.getState().setIsOnline(true);
      syncManager.processQueue();
    });

    window.addEventListener("offline", () => {
      useOfflineStore.getState().setIsOnline(false);
    });

    // Initial sync if online
    if (navigator.onLine) {
      syncManager.processQueue();
    }
  }
}
