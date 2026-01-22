import "next-auth";
import "next-auth/jwt";
import type { ReceiptFormatJson } from "./receipt";

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
      counter?: number;
    };
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
      rank: string;
    }>;
    company?: {
      id: string;
      name: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
      minimum_amount?: number;
      maximum_amount?: number;
    };
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    counter?: number;
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
    counter?: number;
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
      rank: string;
    }>;
    company?: {
      id: string;
      name: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
      minimum_amount?: number;
      maximum_amount?: number;
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
    counter?: number;
    rolesObject?: Array<{
      name: string;
      app_title: string;
      icon_name: string;
      rank: string;
    }>;
    company?: {
      id: string;
      name: string;
      fields_to_hide?: string;
      receipt_format?: number;
      model_type?: string;
      offline?: number;
      receipt_format_json?: ReceiptFormatJson;
      minimum_amount?: number;
      maximum_amount?: number;
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
