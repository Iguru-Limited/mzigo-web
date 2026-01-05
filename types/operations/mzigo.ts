/**
 * Mzigo creation types
 */

import type { ReceiptData } from "./receipt";

export interface CreateMzigoPayload {
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
  /** Optional: human-readable payment method name for offline receipts */
  payment_mode_name?: string;
  p_vehicle: string;
  receiver_route: string;
  commission: string | number;
  special_instructions: string;
}

export interface CreateMzigoResponse {
  status: string;
  message: string;
  data?: ReceiptData;
}

export interface LookupResponse {
  status: string;
  count: number;
  message?: string;
  data: Array<{
    id: string;
    receipt_number: string;
    receipt_2?: string;
    s_date: string;
    s_time: string;
    receipt: Array<{
      text_size: "small" | "normal" | "big";
      content: string;
      "pre-text": string;
      end_1: string;
      is_variable: boolean;
      is_bold: boolean;
    }>;
    package_token: string;
  }>;
}
