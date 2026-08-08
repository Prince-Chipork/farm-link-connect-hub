import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      console.error("Notification error:", error);

      toast.error(
        `Notification failed: ${error.message}`
      );

      return null;
    }

    if (!data?.success) {
      console.error(
        "Notification function returned failure:",
        data
      );

      toast.error(
        `Notification failed: ${
          data?.error || "Unknown error"
        }`
      );

      return null;
    }

    return data;
  } catch (error: any) {
    console.error(
      "Notification request failed:",
      error
    );

    toast.error(
      `Notification failed: ${
        error?.message || "Unknown error"
      }`
    );

    return null;
  }
}
