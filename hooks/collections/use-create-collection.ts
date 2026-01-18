import type { CreateCollectionPayload, CreateCollectionResponse } from "@/types";

export function useCreateCollection() {
  const createCollection = async (payload: CreateCollectionPayload): Promise<CreateCollectionResponse> => {
    const response = await fetch("/api/collections/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create collection");
    }

    return response.json();
  };

  return { createCollection };
}
