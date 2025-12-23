"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateMzigo } from "@/hooks/use-create-mzigo";

export function CreateShipmentForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { createMzigo } = useCreateMzigo();

  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    receiverTown: "", // dropdown option ID
    parcelDescription: "",
    parcelValue: "",
    packageSize: "", // dropdown option ID
    amountCharged: "",
    paymentMode: "", // dropdown option ID
    vehiclePlate: "",
    receiverRoute: "", // dropdown option ID
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
        receiver_town: formData.receiverTown,
        parcel_description: formData.parcelDescription,
        parcel_value: formData.parcelValue,
        package_size: formData.packageSize,
        amount_charged: formData.amountCharged,
        payment_mode: formData.paymentMode,
        p_vehicle: formData.vehiclePlate,
        receiver_route: formData.receiverRoute,
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
              <Label htmlFor="receiverTown">Receiver Town</Label>
              <select
                id="receiverTown"
                name="receiverTown"
                value={formData.receiverTown}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white text-black rounded border border-input"
              >
                <option value="">Select Town</option>
                <option value="1">Nairobi</option>
                <option value="2">Mombasa</option>
                <option value="3">Kisumu</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverRoute">Receiver Route</Label>
              <select
                id="receiverRoute"
                name="receiverRoute"
                value={formData.receiverRoute}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white text-black rounded border border-input"
              >
                <option value="">Select Route</option>
                <option value="1">Nairobi - Mombasa</option>
                <option value="2">Nairobi - Kisumu</option>
                <option value="3">Mombasa - Nairobi</option>
              </select>
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
              <Label htmlFor="packageSize">Package Size</Label>
              <select
                id="packageSize"
                name="packageSize"
                value={formData.packageSize}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white text-black rounded border border-input"
              >
                <option value="">Select Size</option>
                <option value="1">Small</option>
                <option value="2">Medium</option>
                <option value="3">Large</option>
                <option value="4">Extra Large</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehiclePlate">Vehicle Plate Number</Label>
            <Input
              id="vehiclePlate"
              name="vehiclePlate"
              placeholder="e.g., KAA 123B"
              value={formData.vehiclePlate}
              onChange={handleChange}
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
