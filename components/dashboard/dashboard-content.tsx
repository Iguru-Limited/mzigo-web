"use client";

import { ActionCards } from "@/components/action-cards";
import { ProfileCard } from "@/components/profile/profile-card";

export function DashboardContent() {

  return (
    <div className="space-y-4">
      <ProfileCard />
      <ActionCards />
    </div>
  );
}
