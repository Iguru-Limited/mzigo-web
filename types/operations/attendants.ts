/**
 * Attendants list types
 */

export interface Attendant {
  id: string;
  name: string;
  phone_number: string;
  user_level: string;
  stage_id: string;
  active_status: string;
  profile_photo: string | null;
}

export interface AttendantListResponse {
  status: string;
  count: number;
  data: Attendant[];
}
