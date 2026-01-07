"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DispatchManager } from "@/components/dispatch/dispatch-manager";

export default function DispatchPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        {/* <h1 className="text-2xl font-bold md:text-3xl">Dispatch</h1> */}
      </div>

      <div className="grid gap-4 md:gap-6">
        <Card>
          <CardHeader>
            {/* <CardTitle>Dispatch Management</CardTitle> */}
          </CardHeader>
          <CardContent>
            <DispatchManager />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
