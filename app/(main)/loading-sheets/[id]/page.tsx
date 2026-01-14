"use client";

import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLoadingSheets } from "@/hooks/loading/use-loading-sheets";
import { LoadingSheetDetail } from "@/components/loading-sheets/loading-sheet-detail";
import { useRouter } from "next/navigation";

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function LoadingSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const today = toLocalISO(new Date());
  
  const { sheets, isLoading } = useLoadingSheets({ 
    type: "loaded", 
    endDate: today 
  });

  const sheet = sheets.find(s => s.id === id);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3 md:gap-6 md:p-6 w-full lg:max-w-5xl lg:mx-auto">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3 md:gap-6 md:p-6 w-full lg:max-w-5xl lg:mx-auto">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-8 text-center">
            <p className="text-red-700">Loading sheet not found.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-6 md:p-6 w-full lg:max-w-5xl lg:mx-auto">
      <LoadingSheetDetail sheet={sheet} />
    </div>
  );
}
