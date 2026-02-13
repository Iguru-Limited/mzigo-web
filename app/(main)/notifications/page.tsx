"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
       <NotificationCenter />     
    </div>
  );
}
