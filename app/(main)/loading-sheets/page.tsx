"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSheetsList } from "@/components/loading-sheets/loading-sheets-list";

export default function LoadingSheetsPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-6 md:p-6 w-full lg:max-w-5xl lg:mx-auto">
      <Card className="border-border/70 shadow-md bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-xl md:text-2xl">Loading Sheets</CardTitle>
          <CardDescription className="text-xs md:text-sm">View and manage loading sheets by date</CardDescription>
        </CardHeader>
      </Card>
      
      <LoadingSheetsList />
    </div>
  );
}
