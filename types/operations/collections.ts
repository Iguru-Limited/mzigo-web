/**
 * Collections API types
 */

export interface CreateCollectionPayload {
  parcel_ids: string[];
  collector_name: string;
  collector_phone: string;
  national_id: string;
  collector_notes: string;
}

export interface CreateCollectionData {
  collected_count: number;
  collected_date: string;
}

export interface CreateCollectionResponse {
  status: string;
  message: string;
  data: CreateCollectionData;
}

export interface CollectionItem {
  id: string;
  receipt_number: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_town: string;
  receiver_town_name: string;
  parcel_description: string;
  amount_charged: string;
  s_date: string;
  is_collected: string;
  collected_date: string;
  collected_time: string;
  collector_name: string;
  collector_phone: string;
  national_id: string;
  collector_notes: string;
  collected_by_name: string;
}

export interface ListCollectionsParams {
  start_date: string;
  end_date: string;
  is_collected: 0 | 1;
}

export interface ListCollectionsResponse {
  status: string;
  count: number;
  data: CollectionItem[];
}
