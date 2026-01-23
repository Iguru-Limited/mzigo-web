"use client";

import { useEffect,  useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useExpressMzigo, usePaymentMethods, useVerifyExpress } from "@/hooks";
import { ReceiptPreview } from "@/components/receipt/receipt-preview";
import { ReceiptData } from "@/types/operations/receipt";

interface ExpressResultFormProps {
  query: string | null;
}

export function ExpressResultForm({ query }: ExpressResultFormProps) {
  const router = useRouter();
  const { results, isLoading, error, isValidating } = useExpressMzigo(query);
  const { data: paymentMethods, isLoading: paymentLoading } = usePaymentMethods();
  const { verify, isLoading: isVerifying, error: verifyError } = useVerifyExpress();

  const [formData, setFormData] = useState({
    amount_charged: "",
    payment_mode: "",
    parcel_description: "",
    commission: "",
    comment: "",
  });

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const packageData = results[0] || null;

//   const paymentValue = useMemo(() => {
//     if (!packageData) return "";
//     const match = paymentMethods?.find(
//       (method) => method.id === packageData.payment_mode || method.payment_method === packageData.payment_mode
//     );
//     return match?.id || packageData.payment_mode || "";
//   }, [packageData, paymentMethods]);

  const isAccepted = packageData?.onboarding_action === "ACCEPTED" || Boolean(packageData?.date_onboarded);
  const acceptedToastShown = useRef(false);

  useEffect(() => {
    if (isAccepted && !acceptedToastShown.current) {
      toast.success("Package already accepted and onboarded");
      acceptedToastShown.current = true;
    }
  }, [isAccepted]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccept = async () => {
    if (!packageData) return;

    if (!formData.amount_charged.trim()) {
      toast.error("Amount is required");
      return;
    }

    if (!formData.payment_mode.trim()) {
      toast.error("Payment method is required");
      return;
    }

    const response = await verify({
      express_id: packageData.id,
      amount_charged: formData.amount_charged,
      payment_mode: formData.payment_mode,
      parcel_description: formData.parcel_description || packageData.parcel_description,
      onboarding_action: "ACCEPTED",
    });

    if (!response) {
      toast.error("Failed to verify package");
      return;
    }

    if (response.status === "error") {
      toast.error(response.message);
      return;
    }

    if (response.data) {
      setReceiptData({
        id: response.data.id,
        receipt_number: response.data.receipt_number,
        s_date: response.data.s_date,
        s_time: response.data.s_time,
        receipt: response.data.receipt,
        package_token: response.data.package_token,
        print_times: response.data.print_times,
        receipt_status: response.data.receipt_status,
      } as ReceiptData);
      setReceiptOpen(true);
      toast.success("Package verified successfully");
    }
  };

  const handleReject = async () => {
    if (!packageData) return;

    const response = await verify({
      express_id: packageData.id,
      amount_charged: formData.amount_charged,
      payment_mode: formData.payment_mode,
      parcel_description: formData.parcel_description || packageData.parcel_description,
      onboarding_action: "REJECTED",
    });

    if (!response) {
      toast.error("Failed to reject package");
      return;
    }

    if (response.status === "error") {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    setTimeout(() => router.push("/express"), 1500);
  };

  if (!query) {
    return (
      <Card className="max-w-3xl mx-auto p-6">
        <div className="space-y-3">
          <p className="font-semibold">No search provided</p>
          <p className="text-sm text-muted-foreground">Go back and scan or search for an express mzigo.</p>
          <Button onClick={() => router.push("/express")} variant="outline">
            Return to Express
          </Button>
        </div>
      </Card>
    );
  }

  if (isLoading || isValidating) {
    return (
      <Card className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner className="size-5" />
          <span>Loading package details for {query}...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-3xl mx-auto p-6">
        <div className="space-y-3">
          <p className="font-semibold text-red-700">Could not load package</p>
          <p className="text-sm text-red-600">{error.message}</p>
          <Button onClick={() => router.refresh()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!packageData) {
    return (
      <Card className="max-w-3xl mx-auto p-6">
        <div className="space-y-3">
          <p className="font-semibold">No package found</p>
          <p className="text-sm text-muted-foreground">No results for {query}. Check the code and try again.</p>
          <Button onClick={() => router.push("/express")} variant="outline">
            Back to Express
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Express Package</h1>
          <p className="text-sm text-muted-foreground">Details for {query}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/express")}>
          New Search
        </Button>
      </div>

      {receiptOpen && receiptData && (
        <ReceiptPreview
          data={receiptData}
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
        />
      )}

      {verifyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{verifyError}</p>
        </div>
      )}

      {/* Grid layout: 2 columns for sender/receiver, 1 full width for processing */}
      <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sender Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-800 text-white py-4 px-6">
              <h2 className="text-lg font-bold">Sender Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium text-foreground">{packageData.sender_name}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="font-medium text-foreground">{packageData.sender_phone}</p>
              </div>
              <div>
                <Label>Town</Label>
                <p className="font-medium text-foreground">{packageData.sender_town}</p>
              </div>
            </div>
          </div>

          {/* Receiver Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-600 text-white py-4 px-6">
              <h2 className="text-lg font-bold">Receiver Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium text-foreground">{packageData.receiver_name}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="font-medium text-foreground">{packageData.receiver_phone}</p>
              </div>
              <div>
                <Label>Town</Label>
                <p className="font-medium text-foreground">{packageData.receiver_town}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parcel Details Card - Always Visible */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-purple-700 text-white py-4 px-6">
            <h2 className="text-lg font-bold">Parcel Details</h2>
            <p className="text-sm text-purple-100">Parcel description and specifications</p>
          </div>
          <div className="p-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parcel_description_view">Description</Label>
              <Input id="parcel_description_view" value={packageData.parcel_description} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parcel_value">Value</Label>
              <Input id="parcel_value" value={packageData.parcel_value} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="package_size">Package Size</Label>
              <Input id="package_size" value={packageData.package_size} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Input id="special_instructions" value={packageData.special_instructions} readOnly />
            </div>
          </div>
        </div>

        {!isAccepted && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Details</CardTitle>
              <CardDescription>Enter payment and processing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount_charged">Amount *</Label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 border border-r-0 border-input rounded-l-md text-sm">
                      KES
                    </span>
                    <Input
                      id="amount_charged"
                      name="amount_charged"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount_charged}
                      onChange={handleFormChange}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_mode">Payment Method *</Label>
                  <select
                    id="payment_mode"
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleFormChange}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    <option value="">
                      {paymentLoading ? "Loading..." : "Select payment method"}
                    </option>
                    {paymentMethods?.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.payment_method}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission">Commission (Optional)</Label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 border border-r-0 border-input rounded-l-md text-sm">
                      KES
                    </span>
                    <Input
                      id="commission"
                      name="commission"
                      type="number"
                      placeholder="Enter commission"
                      value={formData.commission}
                      onChange={handleFormChange}
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parcel_description">Description (Optional)</Label>
                  <Input
                    id="parcel_description"
                    name="parcel_description"
                    placeholder="Update parcel description if needed"
                    value={formData.parcel_description}
                    onChange={handleFormChange}
                    defaultValue={packageData.parcel_description}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <textarea
                  id="comment"
                  name="comment"
                  placeholder="Add any notes or comments..."
                  value={formData.comment}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAccept}
                  disabled={isVerifying}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isVerifying ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    "Accept & Verify"
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isVerifying}
                  variant="destructive"
                  className="flex-1"
                >
                  {isVerifying ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
