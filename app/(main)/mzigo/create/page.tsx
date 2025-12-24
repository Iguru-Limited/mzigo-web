"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateMzigoForm } from "@/components/mzigo-create/create-shipment-form";

export default function CreateShipmentPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Create New Mzigo</h1>
      </div>

      <div className="grid gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mzigo Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMzigoForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
