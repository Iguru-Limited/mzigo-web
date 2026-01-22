/**
 * Notification API types
 */

export interface NotificationItem {
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
  is_notified: string;
  notify_date: string | null;
  notify_time: string | null;
  notified_by_name: string | null;
}

export interface ListNotificationsParams {
  type: "notified" | "unnotified";
  start_date: string;
  end_date: string;
}

export interface ListNotificationsResponse {
  status: string;
  count: number;
  data: NotificationItem[];
}

export interface NotifyParcelPayload {
  parcel_id: string;
  notification_method?: string; // e.g., "sms", "whatsapp"
}

export interface NotifyParcelResponse {
  status: string;
  message: string;
  data?: {
    id: string;
    receipt_number: string;
    is_notified: string;
    notify_date: string;
    notify_time: string;
  };
}

export interface CreateNotificationPayload {
  parcel_ids: (string | number)[];
}

export interface CreateNotificationData {
  total: number;
  sent: number;
  failed: number;
}

export interface CreateNotificationResponse {
  status: string;
  message: string;
  data: CreateNotificationData;
}
