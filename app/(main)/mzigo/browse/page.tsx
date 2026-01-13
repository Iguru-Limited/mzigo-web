"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MzigoBrowser } from "@/components/mzigo-browse/mzigo-browser";

export default function BrowseMzigosPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold md:text-3xl">Browse Mzigos</h1> */}
      </div>

      <div className="grid gap-4 md:gap-6 max-w-5xl w-full mx-auto">
        <Card className="border-border/70 shadow-sm bg-card/90">
          <CardHeader>
            <CardTitle>Browse All Mzigos</CardTitle>
            <CardDescription>Review consignments with filters and quick drill-downs.</CardDescription>
          </CardHeader>
          <CardContent>
            <MzigoBrowser/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
