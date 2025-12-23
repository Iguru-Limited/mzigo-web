import { useSession } from "next-auth/react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/constants";

interface CreateMzigoPayload {
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_town: string;
  parcel_description: string;
  parcel_value: string | number;
  package_size: string;
  amount_charged: string | number;
  payment_mode: string;
  p_vehicle: string;
  receiver_route: string;
  commission: string | number;
  special_instructions: string;
}

interface CreateMzigoResponse {
  status: string;
  message: string;
  data?: {
    id: string;
    receipt_number: string;
    package_token: string;
    s_date: string;
    s_time: string;
  };
}

export function useCreateMzigo() {
  const { data: session } = useSession();

  const createMzigo = async (payload: CreateMzigoPayload): Promise<CreateMzigoResponse> => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      throw new Error("Access token not available");
    }

    const apiUrl = getApiUrl(API_ENDPOINTS.CREATE_MZIGO);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data: CreateMzigoResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create mzigo");
      }

      return data;
    } catch (error) {
      console.error("Error creating mzigo:", error);
      throw error;
    }
  };

  return { createMzigo, isLoading: false };
}
