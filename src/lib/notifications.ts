import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createNotification(params: any) {
  try {
    toast.info("Calling Edge Function...");

    const response = await supabase.functions.invoke(
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

    console.log(response);

    toast.success("Edge Function response received");

    if (response.error) {
      toast.error(JSON.stringify(response.error));
    }

    return response.data;
  } catch (e) {
    console.error(e);
    toast.error(String(e));
  }
}
