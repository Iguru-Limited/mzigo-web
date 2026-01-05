/**
 * Receipt types based on create mzigo response
 */

export type TextSize = "small" | "normal" | "big";

export interface ReceiptItem {
  text_size: TextSize;
  content: string;
  /** note: API uses hyphenated key */
  ["pre-text"]: string;
  ["end_1"]: string;
  is_variable: boolean;
  is_bold: boolean;
}

export interface ReceiptData {
  id: string;
  receipt_number: string;
  package_token?: string;
  s_date: string;
  s_time: string;
  receipt: ReceiptItem[];
}

/**
 * Offline mzigo payload structure
 */
export interface OfflineMzigoPayload {
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

/**
 * Options for generating offline receipts
 */
export interface OfflineReceiptOptions {
  offlineId: string;
  payload: OfflineMzigoPayload;
  /** Name of the user who served (from session.user.name) */
  servedBy?: string;
  /** Company name (from session.company.name) */
  companyName?: string;
  /** Office/location name (from session.office.name) */
  officeName?: string;
  /** Company phone number */
  companyPhone?: string;
  /** Receipt format template from session.company.receipt_format_json */
  receiptFormatJson?: ReceiptFormatJson;
  /** Optional resolved payment method name to display on offline receipt */
  resolvedPaymentModeName?: string;
  /** Sequential counter for offline waybill numbering (off-1, off-2, etc.) */
  offlineReceiptCount?: number;
}

/**
 * Map of variable names to their values for receipt template substitution
 */
export type ReceiptVariables = Record<string, string>;

/**
 * Receipt format line item from API
 */
export interface ReceiptFormatItem {
  text_size: TextSize;
  content: string;
  "pre-text": string;
  end_1: string;
  is_variable: boolean;
  is_bold: boolean;
}

/**
 * Receipt format JSON object from API (keyed by string index)
 */
export type ReceiptFormatJson = Record<string, ReceiptFormatItem>;
