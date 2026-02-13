"use client";

import { DuplicateManager } from "@/components/duplicate/duplicate-manager";

export default function DuplicatePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">     

      <div className="grid gap-4 md:gap-6 max-w-5xl w-full mx-auto">
        <DuplicateManager /> 
      </div>
    </div>
  );
}
