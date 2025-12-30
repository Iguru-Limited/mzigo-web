import "next-auth";
import "next-auth/jwt";

/** Receipt format line item from API */
export interface ReceiptFormatItem {
  text_size: "small" | "normal" | "big";
  content: string;
  "pre-text": string;
  end_1: string;
  is_variable: boolean;
  is_bold: boolean;
}

/** Receipt format JSON object from API (keyed by string index) */
export type ReceiptFormatJson = Record<string, ReceiptFormatItem>;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string;
      image?: string | null;
      rights?: string[];
      user_level?: string;
      printer_name?: string;
    };
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
    }>;
    company?: {
      id: string;
      name: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
    };
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    role?: {
      id: string;
      name: string;
      rank: string;
    };
    office?: {
      id: string;
      name: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string;
    image?: string | null;
    rights?: string[];
    user_level?: string;
    printer_name?: string;
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
    }>;
    company?: {
      id: string;
      name: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
    };
    accessToken?: string;
    refreshToken?: string;
    role?: {
      id: string;
      name: string;
      rank: string;
    };
    office?: {
      id: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    refreshTokenExpiresAt?: number;
    phone?: string;
    rights?: string[];
    user_level?: string;
    printer_name?: string;
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
    }>;
    company?: {
      id: string;
      name: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
    };
    role?: {
      id: string;
      name: string;
      rank: string;
    };
    office?: {
      id: string;
      name: string;
    };
  }
}
