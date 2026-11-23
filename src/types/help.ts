export type HelpCategory =
  | "medicine"
  | "blood"
  | "oxygen"
  | "transport"
  | "medical_advice"
  | "other";

export type HelpUrgency = "low" | "medium" | "high" | "critical";

export type HelpStatus = "open" | "helper_found" | "resolved" | "cancelled";

export interface HelpRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  category: HelpCategory;
  message: string;
  urgency: HelpUrgency;
  city: string;
  approx_area: string;
  lat: number;
  lng: number;
  distance?: number;
  status: HelpStatus;
  helper_id?: string | null;
  helper_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  type: string;
  payload: {
    title: string;
    body: string;
    requestId?: string;
  };
  read: boolean;
  created_at: string;
}
