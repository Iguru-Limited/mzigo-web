/**
 * Dispatch types for loading sheets
 */

export interface LoadingSheet {
  id: string;
  sheet_number: string;
  company_id: string;
  office_id: string;
  user_id: string;
  vehicle: string;
  destination_id: string;
  loading_date: string;
  created_at: string;
  destination_name: string;
  dispatch_date: string | null;
  parcel_count: string;
}

export interface ListLoadingSheetsResponse {
  status: string;
  count: number;
  data: LoadingSheet[];
}

export interface CreateDispatchPayload {
  sheet_number: string;
  courier: string;
  end_town: string;
  courier_contacts: string;
}

export interface CreateDispatchResponse {
  status: string;
  message: string;
  dispatch_id: string;
}
