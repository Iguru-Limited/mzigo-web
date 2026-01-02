import { openDB, DBSchema, IDBPDatabase } from "idb";

// Define the database schema
interface MzigoDBSchema extends DBSchema {
  // Store for cached API responses
  cache: {
    key: string;
    value: {
      data: unknown;
      timestamp: number;
      expiresAt: number;
    };
  };
  // Store for pending sync operations
  syncQueue: {
    key: number;
    value: {
      id?: number;
      type: "create" | "update" | "delete";
      endpoint: string;
      method: string;
      payload: unknown;
      timestamp: number;
      retries: number;
      maxRetries: number;
    };
    indexes: { "by-timestamp": number };
  };
  // Store for offline-created shipments
  offlineShipments: {
    key: string;
    value: {
      id: string;
      data: unknown;
      createdAt: number;
      synced: boolean;
    };
  };
  // Store for reference data (destinations, routes, vehicles, sizes, payment-methods)
  referenceData: {
    key: string;
    value: {
      type: "destinations" | "routes" | "vehicles" | "sizes" | "payment-methods";
      data: unknown[];
      timestamp: number;
    };
  };
}

const DB_NAME = "mzigo-offline-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<MzigoDBSchema> | null = null;

export async function getDB(): Promise<IDBPDatabase<MzigoDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<MzigoDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Cache store for API responses
      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache");
      }

      // Sync queue for pending operations
      if (!db.objectStoreNames.contains("syncQueue")) {
        const syncStore = db.createObjectStore("syncQueue", {
          keyPath: "id",
          autoIncrement: true,
        });
        syncStore.createIndex("by-timestamp", "timestamp");
      }

      // Offline shipments
      if (!db.objectStoreNames.contains("offlineShipments")) {
        db.createObjectStore("offlineShipments");
      }

      // Reference data
      if (!db.objectStoreNames.contains("referenceData")) {
        db.createObjectStore("referenceData");
      }
    },
  });

  return dbInstance;
}

// Cache operations
export async function setCache(key: string, data: unknown, ttlMs: number = 24 * 60 * 60 * 1000) {
  const db = await getDB();
  const now = Date.now();
  await db.put("cache", {
    data,
    timestamp: now,
    expiresAt: now + ttlMs,
  }, key);
}

export async function getCache<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const cached = await db.get("cache", key);
  
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    await db.delete("cache", key);
    return null;
  }
  
  return cached.data as T;
}

export async function clearCache(key?: string) {
  const db = await getDB();
  if (key) {
    await db.delete("cache", key);
  } else {
    await db.clear("cache");
    // Reset offline receipt counter when cache is cleared
    const { resetOfflineReceiptCount } = await import("./store").then(m => m.useOfflineStore.getState());
    resetOfflineReceiptCount();
  }
}

// Reference data operations
export async function setReferenceData(
  type: "destinations" | "routes" | "vehicles" | "sizes" | "payment-methods",
  data: unknown[]
) {
  const db = await getDB();
  await db.put("referenceData", {
    type,
    data,
    timestamp: Date.now(),
  }, type);
}

export async function getReferenceData<T>(
  type: "destinations" | "routes" | "vehicles" | "sizes" | "payment-methods"
): Promise<T[] | null> {
  const db = await getDB();
  const record = await db.get("referenceData", type);
  return record ? (record.data as T[]) : null;
}

// Offline shipments operations
export async function saveOfflineShipment(id: string, data: unknown) {
  const db = await getDB();
  await db.put("offlineShipments", {
    id,
    data,
    createdAt: Date.now(),
    synced: false,
  }, id);
}

export async function getOfflineShipments() {
  const db = await getDB();
  return db.getAll("offlineShipments");
}

export async function markShipmentSynced(id: string) {
  const db = await getDB();
  const shipment = await db.get("offlineShipments", id);
  if (shipment) {
    shipment.synced = true;
    await db.put("offlineShipments", shipment, id);
  }
}

export async function deleteOfflineShipment(id: string) {
  const db = await getDB();
  await db.delete("offlineShipments", id);
}

// Sync queue operations
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

export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "retries">) {
  const db = await getDB();
  await db.add("syncQueue", {
    ...item,
    timestamp: Date.now(),
    retries: 0,
  });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "by-timestamp");
}

export async function updateSyncQueueItem(item: SyncQueueItem) {
  const db = await getDB();
  await db.put("syncQueue", item);
}

export async function removeFromSyncQueue(id: number) {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function clearSyncQueue() {
  const db = await getDB();
  await db.clear("syncQueue");
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count("syncQueue");
}
