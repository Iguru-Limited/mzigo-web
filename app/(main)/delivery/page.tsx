"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryManager } from "@/components/delivery/delivery-manager";

export default function DeliveryPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Delivery Management</h1>
      </div> */}
        <DeliveryManager />
      {/* <div className="grid gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
