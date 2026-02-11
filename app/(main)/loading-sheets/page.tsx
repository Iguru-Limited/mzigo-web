"use client";

import { LoadingSheetsList } from "@/components/loading-sheets/loading-sheets-list";

export default function LoadingSheetsPage() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-6 md:p-6 w-full lg:max-w-5xl lg:mx-auto">   
    <LoadingSheetsList />
    </div>
  );
}
