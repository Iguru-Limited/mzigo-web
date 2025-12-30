"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { OfflineProvider } from "@/components/offline";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
