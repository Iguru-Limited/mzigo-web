/**
 * Route Types
 */
export interface RouteItem {
  id: string;
  route_name: string;
}

export interface RouteListResponse {
  status: "success" | "error";
  count: number;
  data: RouteItem[];
  message?: string;
}
