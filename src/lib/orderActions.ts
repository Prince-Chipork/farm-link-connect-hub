import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/lib/notifications";

export async function updateOrderStatus(
  orderItemId: string,
  newStatus: string
) {
  const { data, error } = await (supabase as any).rpc(
    "update_farmer_order_status",
    {
      p_order_item_id: orderItemId,
      p_status: newStatus,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}
