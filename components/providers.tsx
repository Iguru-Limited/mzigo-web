"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { OfflineProvider } from "@/components/offline";
import { useRouter, usePathname } from "next/navigation";

// Component to handle automatic session refresh and activity tracking
function SessionRefresher({ children }: { children: React.ReactNode }) {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = useRef(Date.now());
  const refreshingRef = useRef(false);

  // Update last activity time on user interaction
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check if session is valid and refresh if needed
  const checkAndRefreshSession = useCallback(async () => {
    if (refreshingRef.current) return;
    
    try {
      refreshingRef.current = true;
      const newSession = await update();
      
      // If session is null or missing access token, user needs to re-login
      if (!newSession || !(newSession as any).accessToken) {
        console.log("Session invalid - redirecting to login");
        toast.error("Session Expired", {
          description: "Please log in again to continue.",
          duration: 5000,
        });
        await signOut({ callbackUrl: `/login?callbackUrl=${pathname}` });
        return;
      }
      
      console.log("Session refreshed successfully at", new Date().toISOString());
    } catch (error) {
      console.error("Failed to refresh session:", error);
      // On refresh failure, redirect to login
      toast.error("Session Expired", {
        description: "Please log in again to continue.",
        duration: 5000,
      });
      await signOut({ callbackUrl: `/login?callbackUrl=${pathname}` });
    } finally {
      refreshingRef.current = false;
    }
  }, [update, pathname]);

  useEffect(() => {
    // Skip if not authenticated or on login page
    if (status !== "authenticated" || pathname === "/login") return;

    // Refresh session every 50 seconds (before the 60-second token expiry)
    const interval = setInterval(() => {
      checkAndRefreshSession();
    }, 50000); // 50 seconds

    // Activity listeners - refresh when user returns after being idle
    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // If user was idle for more than 60 seconds, refresh session immediately
      if (timeSinceLastActivity > 60000 && session) {
        console.log("User returned after idle period - refreshing session");
        checkAndRefreshSession();
      }
      
      updateActivity();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Refresh when window/tab becomes visible (user returns to the app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && session) {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;
        
        // If tab was hidden for more than 60 seconds, refresh immediately
        if (timeSinceLastActivity > 60000) {
          console.log("Tab visible after being hidden - refreshing session");
          checkAndRefreshSession();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, status, pathname, checkAndRefreshSession, updateActivity]);

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
