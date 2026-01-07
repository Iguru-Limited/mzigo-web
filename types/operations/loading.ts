export interface UnloadedParcel {
  id: string;
  company: string;
  receipt_number: string;
  receipt_2: string | null | "-";
  sender_name: string;
  sender_phone: string;
  sender_town: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_town: string;
  parcel_description: string;
  parcel_value: string;
  package_token: string;
  account_id: string;
  s_time: string;
  client_side_id: string;
  s_date: string; // YYYY-MM-DD
  special_instructions: string;
  package_size: string;
  package_id: string;
  package_position: string;
  office: string;
  active_status: string;
  payment_mode: string;
  amount_charged: string;
  p_vehicle: string;
  action_time: string | null;
  receiver_town_extra: string | null;
  receiver_route: string;
  synch_status: string;
  synch_id: string | null;
  synch_date: string | null;
  synch_time: string | null;
  print_times: string;
  commission: string;
  agent_id: string | null;
  loading_sheet_id: string | null;
  receipt_1: string | null;
  receiver_town_name: string | null;
}

export interface UnloadedParcelListResponse {
  status: "success" | "error";
  message?: string;
  count?: number;
  data?: UnloadedParcel[];
}

export interface CreateLegacyLoadingPayload {
  parcel_ids: number[];
  destination_id: number;
}

export interface CreateLegacyLoadingData {
  sheet_number: string;
  loading_sheet_id: string;
  loaded_count: number;
  parcels: UnloadedParcel[];
}

export interface CreateLegacyLoadingResponse {
  status: "success" | "error";
  message?: string;
  data?: CreateLegacyLoadingData;
}

export interface CreateDirectLoadingPayload {
  parcel_ids: number[];
  vehicle: string;
}

export interface CreateDirectLoadingData {
  sheet_number: string;
  loading_sheet_id: string;
  is_new_sheet: boolean;
  sheet_total_items: string;
  parcels: UnloadedParcel[];
}

export interface CreateDirectLoadingResponse {
  status: "success" | "error";
  message?: string;
  data?: CreateDirectLoadingData;
}

export interface CreateDetailedLoadingPayload {
  vehicle: string;
  destination_id: number;
}

export interface CreateDetailedLoadingData {
  sheet_number: string;
  loading_sheet_id: string;
  loaded_count: number;
  parcels: UnloadedParcel[];
}

export interface CreateDetailedLoadingResponse {
  status: "success" | "error";
  message?: string;
  data?: CreateDetailedLoadingData;
}

export interface UpdateDetailedLoadingPayload {
  sheet_number: string;
  parcel_ids: number[];
}

export interface UpdateDetailedSheetDetails {
  id: string;
  sheet_number: string;
  company_id: string;
  office_id: string;
  user_id: string;
  vehicle: string;
  destination_id: string;
  loading_date: string | null;
  created_at: string;
}

export interface UpdateDetailedLoadingData {
  sheet_details: UpdateDetailedSheetDetails;
  loaded_count: number;
  parcels: UnloadedParcel[];
}

export interface UpdateDetailedLoadingResponse {
  status: "success" | "error";
  message?: string;
  data?: UpdateDetailedLoadingData;
}
