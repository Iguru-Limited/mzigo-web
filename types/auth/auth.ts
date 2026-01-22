/**
 * Authentication API response types
 */

import type { ReceiptFormatJson } from "../operations/receipt";

export interface LoginResponse {
  status: string;
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    user_level: string;
    printer_name?: string;
    counter?: number;
    company: {
      id: string;
      name: string;
      count?: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
      minimum_amount?: number;
      maximum_amount?: number;
    };
    office?: {
      id: string;
      name: string;
      contact_details?: string;
      sacco_contacts?: string;
    };
    roles: Array<{
      name: string;
      app_title: string;
      icon_name: string;
      rank: string;
    }>;
  };
}

export interface RefreshResponse {
  message: string;
  access_token: string;
}
