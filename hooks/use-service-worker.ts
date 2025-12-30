"use client";

import { useEffect, useCallback } from "react";
import { useOfflineStore, setupAutoSync, syncManager } from "@/lib/offline";
import { useSession } from "next-auth/react";

interface ServiceWorkerHook {
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  requestSync: () => Promise<void>;
  update: () => Promise<void>;
}

/**
 * Hook to manage service worker registration and lifecycle
 */
export function useServiceWorker(): ServiceWorkerHook {
  const { swRegistered, setSwRegistered } = useOfflineStore();
  const { data: session } = useSession();

  // Register service worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[SW] Service worker registered:", registration.scope);
        setSwRegistered(true);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available
                console.log("[SW] New version available");
              }
            });
          }
        });
      } catch (error) {
        console.error("[SW] Registration failed:", error);
        setSwRegistered(false);
      }
    };

    registerSW();
  }, [setSwRegistered]);

  // Setup sync manager
  useEffect(() => {
    if (!session) return;

    setupAutoSync({
      getAccessToken: async () => {
        return (session as { accessToken?: string } | null)?.accessToken ?? null;
      },
      onSyncComplete: () => {
        console.log("[Sync] Completed successfully");
      },
      onSyncError: (error) => {
        console.error("[Sync] Error:", error);
      },
    });
  }, [session]);

  // Listen for messages from service worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SYNC_REQUIRED") {
        syncManager.forceSync();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  const requestSync = useCallback(async () => {
    if ("serviceWorker" in navigator && "sync" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync?.register("mzigo-sync");
      } catch {
        // Background sync not supported, trigger manual sync
        syncManager.forceSync();
      }
    } else {
      syncManager.forceSync();
    }
  }, []);

  const update = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    }
  }, []);

  return {
    isRegistered: swRegistered,
    registration: null,
    requestSync,
    update,
  };
}
