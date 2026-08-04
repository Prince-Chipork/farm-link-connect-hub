import { supabase } from "@/integrations/supabase/client";

type NotificationType =
  | "general"
  | "new_order"
  | "order_accepted"
  | "order_processing"
  | "order_packed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "payment_received"
  | "system";

type CreateNotificationParams = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
};

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
  link,
  metadata = {},
}: CreateNotificationParams) {
  const { data, error } = await supabase.functions.invoke(
    "create-notification",
    {
      body: {
        user_id: userId,
        title,
        message,
        type,
        link,
        metadata,
      },
    }
  );

  if (error) {
    console.error("Notification Function Error:", error);
    return;
  }

  return data;
}
