"use client";

import { useSession } from "next-auth/react";
import { ActionCards } from "@/components/action-cards";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) return null;


  return (
    <div className="min-h-screen w-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        {/* <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Welcome Back, {user.name}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Access your available actions below
          </p>
        </div> */}

        {/* Action Cards */}
        <ActionCards />
      </div>
    </div>
  );
}
