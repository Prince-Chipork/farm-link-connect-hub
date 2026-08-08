import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "@/lib/notifications";


// =====================================================
// FARMER: Update order item status
// =====================================================

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


// =====================================================
// ADMIN: Update order item status
// =====================================================

export async function updateAdminOrderStatus(
  orderItemId: string,
  newStatus: string
) {
  // Get the order item and related order
  const { data: item, error: fetchError } = await supabase
    .from("order_items")
    .select(`
      id,
      order_id,
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

  // Get the farmer through the product
  const { data: product, error: productError } = await supabase
    .from("order_items")
    .select(`
      product_id,
      products!inner(
        farmer_id
      )
    `)
    .eq("id", orderItemId)
    .single();

  if (productError) {
    throw productError;
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
  if (product?.products?.farmer_id) {
    await createNotification({
      userId: product.products.farmer_id,
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
  }

  return {
    success: true,
    orderId: item.order_id,
    orderItemId,
    status: newStatus,
  };
}
