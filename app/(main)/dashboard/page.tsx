"use client";

import { useSession } from "next-auth/react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1> */}
      </div>

      <div className="grid gap-4 md:gap-6">
        <DashboardContent />
      </div>
    </div>
  );
}
