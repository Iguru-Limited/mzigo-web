import type { CreateDeliveryPayload, CreateDeliveryResponse } from "@/types";

export function useCreateDelivery() {
  const createDelivery = async (payload: CreateDeliveryPayload): Promise<CreateDeliveryResponse> => {
    const response = await fetch("/api/delivery/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create delivery");
    }

    return response.json();
  };

  return { createDelivery };
}
