/**
 * Express mzigo verify types
 */

export interface VerifyExpressPayload {
  express_id: string;
  amount_charged: string;
  payment_mode: string;
  parcel_description: string;
  onboarding_action: "ACCEPTED" | "REJECTED";
}

export interface ReceiptFormatItem {
  text_size: string;
  content: string;
  "pre-text": string;
  end_1: string;
  is_variable: boolean;
  is_bold: boolean;
}

export interface VerifyExpressSuccessResponse {
  status: "success";
  message: string;
  data?: {
    id: string;
    receipt_number: string;
    s_date: string;
    s_time: string;
    receipt: ReceiptFormatItem[];
    package_token: string;
    print_times: number;
    receipt_status: string;
  };
}

export interface VerifyExpressErrorResponse {
  status: "error";
  message: string;
}

export type VerifyExpressResponse = VerifyExpressSuccessResponse | VerifyExpressErrorResponse;
