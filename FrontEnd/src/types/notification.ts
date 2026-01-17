// src/types/notification.ts
export interface Notification {
  id: number;
  user_id: number;
  message: string;
  period: "morning" | "afternoon" | "night";
  is_read: boolean;
  date: string;
  created_at: string;
}
