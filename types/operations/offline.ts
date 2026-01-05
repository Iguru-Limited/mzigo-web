/**
 * Offline storage and sync types
 */

export interface SyncQueueItem {
  id?: number;
  type: "create" | "update" | "delete";
  endpoint: string;
  method: string;
  payload: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface OfflineMzigo {
  id: string;
  data: unknown;
  createdAt: number;
  synced: boolean;
}

export interface CachedData {
  data: unknown;
  timestamp: number;
  expiresAt: number;
}

export interface ReferenceData {
  type: "destinations" | "routes" | "vehicles" | "sizes" | "payment-methods";
  data: unknown[];
  timestamp: number;
}

export interface SyncOptions {
  getAccessToken: () => Promise<string | null>;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  onItemSynced?: (item: SyncQueueItem) => void;
}

export interface OfflineState {
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
