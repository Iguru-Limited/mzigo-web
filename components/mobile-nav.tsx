"use client";

import { useSession, signOut } from "next-auth/react";
import { Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const name = session?.user?.name || "N/A";
  const level = session?.user?.user_level || "N/A";
  const company = session?.company?.name || "N/A";

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b bg-background lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <img src="/logo.jpg" alt="mzigo logo" className="h-12 w-12 object-contain" />
        </Link>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span>profile</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-xs text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-xs text-muted-foreground">Company</span>
                <span className="font-medium text-foreground">{company}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-xs text-muted-foreground">Level</span>
                <span className="font-medium text-foreground">{level}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
        <div className="grid grid-cols-2 items-center px-6 py-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors",
              pathname === "/dashboard"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-7 w-7" />
            <span>home</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-7 w-7" />
            <span>logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
