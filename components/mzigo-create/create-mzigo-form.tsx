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
import {
  useCreateMzigo,
  useVehicles,
  useDestinations,
  useSizes,
  useRoutes,
  usePaymentMethods,
} from "@/hooks";
import { ReceiptPreview } from "@/components/receipt/receipt-preview";
import { ReceiptData } from "@/types/operations/receipt";

export function CreateMzigoForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { createMzigo, isOffline, offlineEnabled } = useCreateMzigo();
  const { data: vehicles, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles();
  const { data: destinations, isLoading: destinationsLoading, error: destinationsError } = useDestinations();
  const { data: sizes, isLoading: sizesLoading, error: sizesError } = useSizes();
  const { data: routes, isLoading: routesLoading, error: routesError } = useRoutes();
  const { data: paymentMethods, isLoading: paymentMethodsLoading, error: paymentMethodsError } = usePaymentMethods();

  // Parse fields to hide from session (comma-separated string)
  const fieldsToHide = session?.company?.fields_to_hide
    ? session.company.fields_to_hide.split(",").map((f) => f.trim().toLowerCase())
    : [];

  const shouldHideField = (fieldId: string) => fieldsToHide.includes(fieldId.toLowerCase());

  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    destination: "",
    receiverRoute: "",
    parcelDescription: "",
    parcelValue: "",
    packageSize: "",
    amountCharged: "",
    paymentMode: "",
    paymentModeName: "",
    vehiclePlate: "",
    commission: "",
    specialInstructions: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "paymentMode") {
      const methodName = paymentMethods.find((m) => String(m.id) === String(value))?.payment_method || "";
      setFormData((prev) => ({ ...prev, paymentMode: value, paymentModeName: methodName }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
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
        receiver_town: formData.destination,
        receiver_route: formData.receiverRoute,
        parcel_description: formData.parcelDescription,
        parcel_value: formData.parcelValue,
        package_size: formData.packageSize,
        amount_charged: formData.amountCharged,
        payment_mode: formData.paymentMode,
        payment_mode_name: formData.paymentModeName,
        p_vehicle: formData.vehiclePlate,
        commission: formData.commission || "0",
        special_instructions: formData.specialInstructions,
      };

      const response = await createMzigo(payload);

      if (response.status === "success" || response.status === "pending") {
        const receiptNumber = response.data?.receipt_number;
        const pendingOffline = response.status === "pending";

        if (pendingOffline) {
          // Offline toast can be enabled if desired
        } else {
          toast.success("Mzigo created successfully!", { description: `Receipt #${receiptNumber}` });
        }

        if (response.data) {
          setReceiptData(response.data as ReceiptData);
          setReceiptOpen(true);
        }
      } else {
        setError(response.message || "Failed to create mzigo");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while creating the mzigo";
      if (errorMessage === "OFFLINE_NOT_ALLOWED") {
        setError("You are currently offline. Please connect to the internet to continue using the app.");
        toast.error("Offline mode not available", { description: "Please connect to the internet to create a mzigo." });
      } else {
        setError(errorMessage);
        toast.error("Failed to create mzigo", { description: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isOffline && !offlineEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">You Are Offline</h2>
          <p className="text-red-600">Offline mode is not available for your account. Please connect to the internet.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Sender Details Section */}
      <div className="max-w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        <div className="bg-white py-4">
          <h2 className="text-center text-2xl font-bold text-gray-800">Sender Details</h2>
        </div>
        <div className="bg-green-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Name</label>
              <Input id="senderName" name="senderName" placeholder="value" value={formData.senderName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Phone</label>
              <Input id="senderPhone" name="senderPhone" type="tel" placeholder="Phone" value={formData.senderPhone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Location</label>
            <Input id="senderLocation" name="senderLocation" placeholder="Location" value={""} readOnly className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Receiver Details Section */}
      <div className="max-w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        <div className="bg-white py-4">
          <h2 className="text-center text-2xl font-bold text-gray-800">Receiver Details</h2>
        </div>
        <div className="bg-blue-600 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Name</label>
              <Input id="receiverName" name="receiverName" placeholder="value" value={formData.receiverName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Phone</label>
              <Input id="receiverPhone" name="receiverPhone" type="tel" placeholder="Phone" value={formData.receiverPhone} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DestinationInput
                id="destination"
                value={formData.destination}
                onChange={(value) => setFormData((prev) => ({ ...prev, destination: value }))}
                destinations={destinations}
                isLoading={destinationsLoading}
                error={destinationsError}
                placeholder="Choose"
                required
              />
            </div>
            {!shouldHideField("route_field") && (
              <div>
                <RouteInput
                  id="receiverRoute"
                  value={formData.receiverRoute}
                  onChange={(value) => setFormData((prev) => ({ ...prev, receiverRoute: value }))}
                  routes={routes}
                  isLoading={routesLoading}
                  error={routesError}
                  placeholder="Search route by name"
                  required
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mzigo Details Section */}
      <div className="max-w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        <div className="bg-white py-4">
          <h2 className="text-center text-2xl font-bold text-gray-800">Mzigo Details</h2>
        </div>
        <div className="bg-neutral-800 p-6 space-y-4">
          {!shouldHideField("vehicle_field") && (
            <div>
              <label className="block text-white font-semibold mb-2">Vehicle</label>
              <VehicleInput
                id="vehiclePlate"
                value={formData.vehiclePlate}
                onChange={(value) => setFormData((prev) => ({ ...prev, vehiclePlate: value }))}
                vehicles={vehicles}
                isLoading={vehiclesLoading}
                error={vehiclesError}
                placeholder="Choose vehicle"
                required
              />
            </div>
          )}

          {!shouldHideField("extra_field") && (
            <div>
              <label className="block text-white font-semibold mb-2">Destination</label>
              <textarea
                id="parcelDescription"
                name="parcelDescription"
                placeholder="Description"
                value={formData.parcelDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-white font-semibold mb-2">Value</label>
            <Input id="parcelValue" name="parcelValue" type="number" placeholder="(KES)" value={formData.parcelValue} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500" required />
          </div>

          {!shouldHideField("size_field") && (
            <div>
              <label className="block text-white font-semibold mb-2">Package Size</label>
              <SizeSelect
                id="packageSize"
                value={formData.packageSize}
                onChange={(value) => setFormData((prev) => ({ ...prev, packageSize: value }))}
                sizes={sizes}
                isLoading={sizesLoading}
                error={sizesError}
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="max-w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        <div className="bg-white py-4">
          <h2 className="text-center text-2xl font-bold text-gray-800">Payment Details</h2>
        </div>
        <div className="bg-amber-700 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Delivery Amount</label>
              <Input id="amountCharged" name="amountCharged" type="number" placeholder="Delivery Amount (KES)" value={formData.amountCharged} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500" required />
            </div>
            {!shouldHideField("commission_field") && (
              <div>
                <label className="block text-white font-semibold mb-2">Commission</label>
                <Input id="commission" name="commission" type="number" placeholder="Commission amount" value={formData.commission} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Payment Method</label>
            <select
              id="paymentMode"
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
              required
              disabled={paymentMethodsLoading}
              className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              <option value="">{paymentMethodsLoading ? "Loading..." : paymentMethodsError ? "Error loading" : "Select payment method"}</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>{method.payment_method}</option>
              ))}
            </select>
            {paymentMethodsError && <p className="text-xs text-red-200">{paymentMethodsError}</p>}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full py-2" disabled={isLoading}>{isLoading ? "Creating Mzigo..." : "Create Mzigo"}</Button>

      <ReceiptPreview
        open={receiptOpen}
        data={receiptData}
        onClose={() => {
          setReceiptOpen(false);
          router.push("/dashboard");
        }}
      />
    </form>
  );
}
