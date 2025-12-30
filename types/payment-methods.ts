/**
 * Payment Methods Types
 * Types for payment method-related API responses and data structures
 */

export interface PaymentMethod {
  id: string;
  payment_method: string;
}

export interface PaymentMethodListResponse {
  status: "success" | "error";
  count: number;
  data: PaymentMethod[];
  message?: string;
}
