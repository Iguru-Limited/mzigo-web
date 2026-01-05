/**
 * Destination Types
 * Types for destination-related API responses and data structures
 */

export interface Destination {
  id: string;
  name: string;
  count: string;
  route: string;
  phone_number: string;
}

export interface DestinationListResponse {
  status: "success" | "error";
  count: number;
  data: Destination[];
  message?: string;
}
