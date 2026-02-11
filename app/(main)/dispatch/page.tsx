"use client";

import { DispatchManager } from "@/components/dispatch/dispatch-manager";

export default function DispatchPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">  

      <div className="grid gap-4 md:gap-6 max-w-5xl w-full mx-auto">
      <DispatchManager />

      </div>
    </div>
  );
}
