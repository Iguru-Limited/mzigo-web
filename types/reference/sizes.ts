/**
 * Size Types
 * Types for size-related API responses and data structures
 */

export interface Size {
  id: string;
  name: string;
  rank: string;
}

export interface SizeListResponse {
  status: "success" | "error";
  count: number;
  data: Size[];
  message?: string;
}
