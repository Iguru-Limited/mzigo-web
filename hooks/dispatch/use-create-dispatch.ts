import type { CreateDispatchPayload, CreateDispatchResponse } from "@/types";

export function useCreateDispatch() {
  const createDispatch = async (payload: CreateDispatchPayload): Promise<CreateDispatchResponse> => {
    const response = await fetch("/api/dispatch/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create dispatch");
    }

    return response.json();
  };

  return { createDispatch };
}
