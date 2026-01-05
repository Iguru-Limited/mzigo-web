"use client";

import { useState, useEffect, useRef } from "react";
import { useOfflineStore } from "@/lib/offline";

interface NetworkConnection {
  type?: string;
  effectiveType?: string;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
}

export interface OnlineStatusHook {
  isOnline: boolean;
  wasOffline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
}

/**
 * Hook to monitor online/offline status with enhanced network information
 */
export function useOnlineStatus(): OnlineStatusHook {
  const { isOnline, setIsOnline } = useOfflineStore();
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [effectiveType, setEffectiveType] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getConnection = (): NetworkConnection | undefined => {
      if ("connection" in navigator) {
        return (navigator as Navigator & { connection?: NetworkConnection }).connection;
      }
      return undefined;
    };

    const updateNetworkInfo = () => {
      const connection = getConnection();
      if (connection) {
        setConnectionType(connection.type || null);
        setEffectiveType(connection.effectiveType || null);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (!isOnline) {
        setWasOffline(true);
        setTimeout(() => setWasOffline(false), 5000);
      }
      updateNetworkInfo();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateNetworkInfo();
    };

    // Initial state - only run once
    if (!initializedRef.current) {
      initializedRef.current = true;
      // Use queueMicrotask to avoid synchronous state update in effect
      queueMicrotask(() => {
        setIsOnline(navigator.onLine);
        updateNetworkInfo();
      });
    }

    // Listen for changes
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection = getConnection();
    connection?.addEventListener?.("change", updateNetworkInfo);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      connection?.removeEventListener?.("change", updateNetworkInfo);
    };
  }, [setIsOnline, isOnline]);

  return {
    isOnline,
    wasOffline,
    connectionType,
    effectiveType,
  };
}
