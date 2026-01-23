/**
 * Express mzigo lookup types
 */

export interface ExpressMzigoItem {
  id: string;
  company: string;
  office: string;
  sender_name: string;
  sender_phone: string;
  sender_town: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_town: string;
  parcel_description: string;
  parcel_value: string;
  package_token: string | null;
  account_id: string;
  client_side_id: string | null;
  s_time: string;
  s_date: string;
  special_instructions: string;
  package_size: string;
  package_id: string | null;
  package_position: string;
  active_status: string;
  payment_mode: string;
  amount_charged: string;
  receipt_number: string | null;
  p_vehicle: string | null;
  receiver_town_extra: string | null;
  receiver_route: string | null;
  generated_code: string;
  temp_id: string;
  fingerprint: string;
  is_suspicious: string;
  suspect_score: string | null;
  suspect_of_id: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  onboarding_user: string | null;
  onboarding_action: string | null;
  date_onboarded: string | null;
  assigned_id: string | null;
  assigned_receipt: string | null;
  office_assigned: string | null;
  company_assigned: string | null;
  assigned_amount: string;
  receiver_town_name: string | null;
}

export interface ExpressMzigoResponse {
  status: string;
  count: number;
  data: ExpressMzigoItem[];
}
