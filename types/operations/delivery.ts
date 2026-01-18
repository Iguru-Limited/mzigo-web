/**
 * Delivery API types
 */

export interface CreateDeliveryPayload {
  parcel_ids: string[];
  delivery_vehicle: string;
  delivery_notes: string;
}

export interface DeliveredParcelInfo {
  id: string;
  receipt_number: string;
  receiver_phone: string;
}

export interface CreateDeliveryData {
  delivered_count: number;
  delivered_date: string;
  delivered_time: string;
  parcels: DeliveredParcelInfo[];
}

export interface CreateDeliveryResponse {
  status: string;
  message: string;
  data: CreateDeliveryData;
}

export interface DeliveryItem {
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
  payment_mode: string;
  s_date: string;
  is_delivered: string;
  delivered_date: string;
  delivered_time: string;
  delivery_vehicle: string;
  delivered_notes: string;
  delivered_by_name: string;
}

export interface ListDeliveriesParams {
  type: "delivered" | "undelivered";
  start_date: string;
  end_date: string;
}

export interface ListDeliveriesResponse {
  status: string;
  count: number;
  data: DeliveryItem[];
}
