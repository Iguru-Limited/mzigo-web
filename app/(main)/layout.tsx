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

      {/* Mobile Navigation - Only visible on mobile */}
      <div className="lg:hidden">
        <MobileNav />
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>

      <div className="hidden lg:block">
        <DesktopNav />
        <main className="mx-auto flex max-w-7xl flex-1 flex-col px-6">
          {children}
        </main>
      </div>
    </>
  );
}

