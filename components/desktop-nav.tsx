"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DesktopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const name = session?.user?.name || "N/A";
  const level = session?.user?.user_level || "N/A";
  const company = session?.company?.name || "N/A";
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.jpg" alt="mzigo logo" width={64} height={64} style={{ objectFit: "contain" }} unoptimized />
          </Link>

          <div className="flex items-center gap-6">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">Profile</span>
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
      </div>
    </header>
  );
}
