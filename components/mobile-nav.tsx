"use client";

import { useSession, signOut } from "next-auth/react";
import { Home, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="sticky top-0 z-50 border-b bg-background lg:hidden">
      <div className="grid grid-cols-4 items-center px-4 py-3">
        {/* Logo (first) */}
        <div className="flex flex-col items-center justify-center gap-1">
          <img src="/logo.jpg" alt="mzigo logo" className="h-15 w-15 object-contain" />
          {/* <span className="text-xs">logo</span> */}
        </div>

        {/* Home */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors",
            pathname === "/dashboard"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="h-8 w-8" />
          <span>home</span>
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors",
            pathname === "/profile"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCircle className="h-8 w-8" />
          <span>profile</span>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-8 w-8" />
          <span>logout</span>
        </button>
      </div>
    </div>
  );
}
