/**
 * Dispatch types for loading sheets
 */

export interface Parcel {
  id: string;
  company: string;
  receipt_number: string;
  receipt_2: string | null;
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
  s_date: string;
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
  loading_sheet_id: string;
  receipt_1: string | null;
  loading_attempts: string;
  receiver_town_name: string | null;
}

export interface LoadingSheet {
  id: string;
  sheet_number: string;
  company_id: string;
  office_id: string;
  user_id: string;
  vehicle: string | null;
  destination_id: string;
  loading_date: string | null;
  created_at: string;
  destination_name: string;
  loader_name: string;
  parcel_count: string;
  dispatch_status: "dispatched" | "undispatched";
  dispatch_date: string | null;
  parcels: Parcel[];
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
