"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid h-16 grid-cols-3 items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1">
            <img src="/logo.jpg" alt="mzigo logo" className="h-16 w-16" style={{ objectFit: 'contain' }} />
          </Link>

          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-sm font-medium transition-colors",
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-8 w-8" />
            <span className="text-xs">Home</span>
          </Link>

          {/* Profile link removed */}

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-8 w-8" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
