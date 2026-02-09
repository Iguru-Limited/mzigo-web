"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { Spinner } from "@/components/ui/spinner";
import { OfflineBanner } from "@/components/offline";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto size-8" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!session) {
    return null;
  }

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    return "User Portal";
  };

  return (
    <>
      {/* Offline status banner */}
      <OfflineBanner />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Navigation - Only visible on desktop */}
      <div className="hidden lg:block">
        <DesktopNav />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col lg:mx-auto lg:max-w-7xl lg:px-6 pb-24 lg:pb-0">
        {children}
      </main>
    </>
  );
}

