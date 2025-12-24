"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleInput } from "@/components/ui/vehicle-input";
import { DestinationInput } from "@/components/ui/destination-input";
import { SizeSelect } from "@/components/ui/size-select";
import { RouteInput } from "@/components/ui/route-input";
import { useCreateMzigo } from "@/hooks/use-create-mzigo";
import { useVehicles } from "@/hooks/use-vehicles";
import { useDestinations } from "@/hooks/use-destinations";
import { useSizes } from "@/hooks/use-sizes";
import { useRoutes } from "@/hooks/use-routes";

export function CreateMzigoForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { createMzigo } = useCreateMzigo();
  const { vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { destinations, isLoading: destinationsLoading, error: destinationsError } = useDestinations();
  const { sizes, isLoading: sizesLoading, error: sizesError } = useSizes();
  const { routes, isLoading: routesLoading, error: routesError } = useRoutes();

  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    destination: "",
    receiverRoute: "",
    parcelDescription: "",
    parcelValue: "",
    packageSize: "", // dropdown option ID
    amountCharged: "",
    paymentMode: "", // dropdown option ID
    vehiclePlate: "",
    commission: "",
    specialInstructions: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!session?.user) {
        setError("User not authenticated. Please log in again.");
        setIsLoading(false);
        return;
      }

      // Map form data to API payload structure
      const payload = {
        sender_name: formData.senderName,
        sender_phone: formData.senderPhone,
        receiver_name: formData.receiverName,
        receiver_phone: formData.receiverPhone,
        destination: formData.destination,
        receiver_route: formData.receiverRoute,
        parcel_description: formData.parcelDescription,
        parcel_value: formData.parcelValue,
        package_size: formData.packageSize,
        amount_charged: formData.amountCharged,
        payment_mode: formData.paymentMode,
        p_vehicle: formData.vehiclePlate,
        commission: formData.commission,
        special_instructions: formData.specialInstructions,
      };

      console.log("Submitting mzigo payload:", payload);

      const response = await createMzigo(payload);

      if (response.status === "success") {
        const receiptNumber = response.data?.receipt_number;
        
        // Show success toast
        toast.success("Mzigo created successfully!", {
          description: `Receipt #${receiptNumber} `,
        });

        console.log("Mzigo created successfully:", response.data);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(response.message || "Failed to create mzigo");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the mzigo";
      setError(errorMessage);
      toast.error("Failed to create mzigo", {
        description: errorMessage,
      });
      console.error("Error creating mzigo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Sender Details Section */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Sender Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="senderName">Name</Label>
              <Input
                id="senderName"
                name="senderName"
                placeholder="Full Name"
                value={formData.senderName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderPhone">Phone</Label>
              <Input
                id="senderPhone"
                name="senderPhone"
                type="tel"
                placeholder="Phone Number"
                value={formData.senderPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receiver Details Section */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Receiver Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receiverName">Name</Label>
              <Input
                id="receiverName"
                name="receiverName"
                placeholder="Receiver Name"
                value={formData.receiverName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverPhone">Phone</Label>
              <Input
                id="receiverPhone"
                name="receiverPhone"
                type="tel"
                placeholder="Receiver Phone"
                value={formData.receiverPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <DestinationInput
                id="destination"
                value={formData.destination}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, destination: value }))
                }
                destinations={destinations}
                isLoading={destinationsLoading}
                error={destinationsError}
                placeholder="Search destination by name"
                required
              />
            </div>
            <div className="space-y-2">
              <RouteInput
                id="receiverRoute"
                value={formData.receiverRoute}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, receiverRoute: value }))
                }
                routes={routes}
                isLoading={routesLoading}
                error={routesError}
                placeholder="Search route by name"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parcel Details Section */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Parcel Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parcelDescription">Parcel Description</Label>
            <textarea
              id="parcelDescription"
              name="parcelDescription"
              placeholder="Describe the contents of the parcel"
              value={formData.parcelDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-white text-foreground rounded border border-input resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parcelValue">Parcel Value</Label>
              <Input
                id="parcelValue"
                name="parcelValue"
                type="number"
                placeholder="Value in KES"
                value={formData.parcelValue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <SizeSelect
                id="packageSize"
                value={formData.packageSize}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, packageSize: value }))
                }
                sizes={sizes}
                isLoading={sizesLoading}
                error={sizesError}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <VehicleInput
              id="vehiclePlate"
              value={formData.vehiclePlate}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, vehiclePlate: value }))
              }
              vehicles={vehicles}
              isLoading={vehiclesLoading}
              error={vehiclesError}
              placeholder="Search by plate number or fleet number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              placeholder="e.g., Fragile, handle with care"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 bg-white text-foreground rounded border border-input resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Section */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountCharged">Amount Charged</Label>
              <Input
                id="amountCharged"
                name="amountCharged"
                type="number"
                placeholder="Amount in KES"
                value={formData.amountCharged}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission</Label>
              <Input
                id="commission"
                name="commission"
                type="number"
                placeholder="Commission amount"
                value={formData.commission}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMode">Payment Method</Label>
            <select
              id="paymentMode"
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white text-black rounded border border-input"
            >
              <option value="">Select Payment Method</option>
              <option value="1">Cash</option>
              <option value="24">M-Pesa</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full py-2"
        disabled={isLoading}
      >
        {isLoading ? "Creating Mzigo..." : "Create Mzigo"}
      </Button>
    </form>
  );
}
