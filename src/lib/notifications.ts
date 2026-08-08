import { supabase } from "@/integrations/supabase/client";

interface NotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(
  params: NotificationParams
) {
  try {
    const { data, error } =
      await supabase.functions.invoke(
        "create-notification",
        {
          body: {
            user_id: params.userId,
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link ?? null,
            metadata: params.metadata ?? {},
          },
        }
      );

    if (error) {
      console.error(
        "Notification error:",
        error
      );

      return null;
    }

    return data;

  } catch (error) {
    console.error(
      "Notification request failed:",
      error
    );

    return null;
  }
}
