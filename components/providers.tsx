"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { OfflineProvider } from "@/components/offline";

// Component to handle automatic session refresh
function SessionRefresher({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();

  useEffect(() => {
    // Refresh session every 50 seconds (before the 60-second token expiry)
    const interval = setInterval(async () => {
      if (session) {
        try {
          await update();
          console.log("Session refreshed at", new Date().toISOString());
        } catch (error) {
          console.error("Failed to refresh session:", error);
        }
      }
    }, 50000); // 50 seconds

    return () => clearInterval(interval);
  }, [session, update]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={50} refetchOnWindowFocus={true}>
      <SessionRefresher>
        <OfflineProvider>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            expand={true}
            duration={4000}
          />
        </OfflineProvider>
      </SessionRefresher>
    </SessionProvider>
  );
}
