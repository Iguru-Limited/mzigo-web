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
  const minAmount = Number(session?.company?.minimum_amount ?? 0);
  const maxAmount = Number(session?.company?.maximum_amount ?? 0);
  
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

  // Fetch destinations based on selected route
  const { data: destinations, isLoading: destinationsLoading, error: destinationsError } = useDestinations(formData.receiverRoute);
  const { data: sizes, isLoading: sizesLoading, error: sizesError } = useSizes();
  const { data: routes, isLoading: routesLoading, error: routesError } = useRoutes();
  const { data: paymentMethods, isLoading: paymentMethodsLoading, error: paymentMethodsError } = usePaymentMethods();

  // Parse fields to hide from session (comma-separated string)
  const fieldsToHide = session?.company?.fields_to_hide
    ? session.company.fields_to_hide.split(",").map((f) => f.trim().toLowerCase())
    : [];

  const shouldHideField = (fieldId: string) => fieldsToHide.includes(fieldId.toLowerCase());

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

      const amountValue = Number(formData.amountCharged);
      if (Number.isNaN(amountValue)) {
        setError("Please enter a valid delivery amount.");
        setIsLoading(false);
        return;
      }

      if (minAmount && amountValue < minAmount) {
        setError(`Delivery amount must be at least KES ${minAmount.toLocaleString()}.`);
        toast.error("Amount too low", { description: `Minimum allowed is KES ${minAmount.toLocaleString()}` });
        setIsLoading(false);
        return;
      }

      if (maxAmount && amountValue > maxAmount) {
        setError(`Delivery amount must not exceed KES ${maxAmount.toLocaleString()}.`);
        toast.error("Amount too high", { description: `Maximum allowed is KES ${maxAmount.toLocaleString()}` });
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Split Pane: Sender & Receiver Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sender Details Card */}
        <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="bg-white py-4 px-6">
            <h2 className="text-lg font-bold text-gray-800">Sender Details</h2>
          </div>
          <div className="bg-green-800 p-6 space-y-4">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Name</label>
              <Input id="senderName" name="senderName" placeholder="Full name" value={formData.senderName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Phone</label>
              <Input id="senderPhone" name="senderPhone" type="tel" placeholder="Phone number" value={formData.senderPhone} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Location</label>
              <Input id="senderLocation" name="senderLocation" placeholder="Location" value={session?.office?.name || ""} readOnly className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Receiver Details Card */}
        <div className="rounded-2xl overflow-visible shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="bg-white py-4 px-6">
            <h2 className="text-lg font-bold text-gray-800">Receiver Details</h2>
          </div>
          <div className="bg-blue-600 p-6 space-y-4 overflow-visible">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Name</label>
              <Input id="receiverName" name="receiverName" placeholder="Full name" value={formData.receiverName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Phone</label>
              <Input id="receiverPhone" name="receiverPhone" type="tel" placeholder="Phone number" value={formData.receiverPhone} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
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
                  placeholder="Search route"
                  required
                />
              </div>
            )}
            <div>
              <DestinationInput
                id="destination"
                value={formData.destination}
                onChange={(value) => setFormData((prev) => ({ ...prev, destination: value }))}
                destinations={destinations}
                isLoading={destinationsLoading}
                error={destinationsError}
                placeholder={formData.receiverRoute ? "Choose destination" : "Select route first"}
                required
                requireRoute={true}
                disabled={!formData.receiverRoute}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mzigo Details Card */}
      <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="bg-white py-3 px-6">
          <h2 className="text-lg font-bold text-gray-800">Mzigo Details</h2>
        </div>
        <div className="bg-neutral-800 p-6">
          <div className={`grid ${!shouldHideField("vehicle_field") ? "lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
            {!shouldHideField("vehicle_field") && (
              <div>
                <VehicleInput
                  id="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={(value) => setFormData((prev) => ({ ...prev, vehiclePlate: value }))}
                  vehicles={vehicles}
                  isLoading={vehiclesLoading}
                  error={vehiclesError}
                  placeholder="Select vehicle"
                  required
                />
              </div>
            )}

            {!shouldHideField("extra_field") && (
              <div>
                <label className="block text-white text-sm font-semibold mb-1.5">Parcel Description</label>
                <textarea
                  id="parcelDescription"
                  name="parcelDescription"
                  placeholder="Describe the parcel contents"
                  value={formData.parcelDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-semibold mb-1.5">Parcel Value (KES)</label>
              <Input id="parcelValue" name="parcelValue" type="number" placeholder="0.00" value={formData.parcelValue} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent" required />
            </div>

            {!shouldHideField("size_field") && (
              <div>
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
      </div>

      {/* Payment Details Card */}
      <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="bg-white py-3 px-6">
          <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
        </div>
        <div className="bg-amber-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-1.5">Delivery Amount (KES)</label>
              <Input
                id="amountCharged"
                name="amountCharged"
                type="number"
                placeholder="0.00"
                value={formData.amountCharged}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
                min={minAmount || undefined}
                max={maxAmount || undefined}
              />
            </div>
            {!shouldHideField("commission_field") && (
              <div>
                <label className="block text-white text-sm font-semibold mb-1.5">Commission (KES)</label>
                <Input id="commission" name="commission" type="number" placeholder="0.00" value={formData.commission} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-white rounded-lg border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
            )}
            <div className={!shouldHideField("commission_field") ? "lg:col-span-2" : "lg:col-span-2"}>
              <label className="block text-white text-sm font-semibold mb-1.5">Payment Method</label>
              <select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                required
                disabled={paymentMethodsLoading}
                className="w-full px-3.5 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{paymentMethodsLoading ? "Loading..." : paymentMethodsError ? "Error loading" : "Select payment method"}</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>{method.payment_method}</option>
                ))}
              </select>
              {paymentMethodsError && <p className="text-xs text-yellow-100 mt-1">{paymentMethodsError}</p>}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors" disabled={isLoading}>{isLoading ? "Processing..." : "Create Mzigo"}</Button>

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
