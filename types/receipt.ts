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
