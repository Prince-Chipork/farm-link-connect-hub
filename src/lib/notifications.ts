import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createNotification(params: any) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-notification",
      {
        body: {
          user_id: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
          link: params.link,
          metadata: params.metadata,
        },
      }
    );

    if (error) {
      toast.error("Notification Error: " + JSON.stringify(error));
      return;
    }

    toast.success("Notification OK: " + JSON.stringify(data));
    return data;
  } catch (err: any) {
    toast.error("Invoke Failed: " + err.message);
  }
}
