"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, Phone, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>
      </div>

      <div className="grid gap-4 md:gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {/* <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar> */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Name</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {session?.user?.name || "Not available"}
                  </p>
                </div>
                {session?.user?.email && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <p className="mt-1">{session.user.email}</p>
                  </div>
                )}
                {session?.user?.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Phone</span>
                    </div>
                    <p className="mt-1">{session.user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Rights & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(session as any)?.rolesObject && (session as any).rolesObject.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(session as any).rolesObject.map((role: any, index: number) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {role.app_title || role.name}
                    </Badge>
                  ))}
                </div>
              ) : session?.user?.rights && session.user.rights.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {session.user.rights.map((right, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {right}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No rights assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
