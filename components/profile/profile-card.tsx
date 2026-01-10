"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Building2, User, UserCircle } from "lucide-react";

export function ProfileCard() {
  const { data: session } = useSession();

  const name = session?.user?.name || "N/A";
  const level = session?.user?.user_level || "N/A";
  const company = session?.company?.name || "N/A";

  return (
    <Card className="bg-black text-white rounded-xl p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-white/20">
            <User className="h-6 w-6 text-white" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Name: {name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Company: {company}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>Level: {level}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
