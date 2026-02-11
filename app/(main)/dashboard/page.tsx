"use client";

import { useSession } from "next-auth/react";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) return null;

  return (

    
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">      
      <DashboardContent />
    </div>
  );
}
