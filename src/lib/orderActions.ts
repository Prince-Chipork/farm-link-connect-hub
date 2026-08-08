import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/lib/notifications";

export async function updateFarmerOrderStatus(
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

export async function updateAdminOrderStatus(
  orderItemId: string,
  newStatus: string
) {
  // Get the order item and its related order/buyer/farmer
  const { data: item, error: fetchError } = await supabase
    .from("order_items")
    .select(`
      id,
      order_id,
      farmer_id,
      product_id,
      orders!inner(
        id,
        buyer_id
      )
    `)
    .eq("id", orderItemId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  if (!item) {
    throw new Error("Order item not found.");
  }

  // Update the order item status
  const { error: updateError } = await supabase
    .from("order_items")
    .update({
      status: newStatus,
    })
    .eq("id", orderItemId);

  if (updateError) {
    throw updateError;
  }

  // Notify buyer
  await createNotification({
    userId: item.orders.buyer_id,
    title: "Order Status Updated",
    message: `Your order status has been updated to ${newStatus}.`,
    type: "order_status",
    link: `/buyer/orders/${item.order_id}/track`,
    metadata: {
      order_id: item.order_id,
      order_item_id: orderItemId,
      status: newStatus,
    },
  });

  // Notify farmer
  await createNotification({
    userId: item.farmer_id,
    title: "Order Status Updated",
    message: `An order item has been updated to ${newStatus}.`,
    type: "order_status",
    link: "/farmer/orders",
    metadata: {
      order_id: item.order_id,
      order_item_id: orderItemId,
      status: newStatus,
    },
  });

  return {
    success: true,
    orderId: item.order_id,
    orderItemId,
    status: newStatus,
  };
}
