/**
 * Vehicle Types
 * Types for vehicle-related API responses and data structures
 */

export interface Vehicle {
  id: string;
  number_plate: string;
  fleet_number: string;
  active_status: string;
  load_count: string;
}

export interface VehicleListResponse {
  status: "success" | "error";
  count: number;
  data: Vehicle[];
  message?: string;
}
