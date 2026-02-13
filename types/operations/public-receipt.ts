export interface ReceiptLine {
  text_size: "big" | "normal" | "small";
  content: string;
  "pre-text": string;
  end_1: string;
  is_variable: boolean;
  is_bold: boolean;
}

export interface PublicReceiptData {
  id: string;
  receipt_number: string;
  receipt_2: string | null;
  s_date: string;
  s_time: string;
  receipt: ReceiptLine[];
  package_token: string;
  print_times: string;
  is_duplicate: boolean;
  receipt_status: string;
  creator_name: string;
}

export interface PublicReceiptResponse {
  status: "success" | "error";
  data: PublicReceiptData;
  message?: string;
}
