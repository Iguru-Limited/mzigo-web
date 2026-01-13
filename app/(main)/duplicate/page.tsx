"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DuplicateManager } from "@/components/duplicate/duplicate-manager";

export default function DuplicatePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold md:text-3xl">Duplicate</h1> */}
      </div>

      <div className="grid gap-4 md:gap-6 max-w-5xl w-full mx-auto">
        <Card className="border-border/70 shadow-sm bg-card/90">
          <CardHeader>
            <CardTitle>Duplicate Receipts</CardTitle>
            <CardDescription>Reprint receipts securely with audit-friendly flow.</CardDescription>
          </CardHeader>
          <CardContent>
            <DuplicateManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
