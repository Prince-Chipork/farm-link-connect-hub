export function calculateOrderTotal(order: any) {
  if (!order?.order_items) return 0;

  return order.order_items
    .filter(
      (item: any) =>
        item.status?.toLowerCase() !== "cancelled"
    )
    .reduce(
      (total: number, item: any) =>
        total +
        Number(item.price) * Number(item.quantity) +
        Number(item.delivery_fee || 0),
      0
    );
}

export function calculateProductSubtotal(order: any) {
  if (!order?.order_items) return 0;

  return order.order_items
    .filter(
      (item: any) =>
        item.status?.toLowerCase() !== "cancelled"
    )
    .reduce(
      (total: number, item: any) =>
        total +
        Number(item.price) * Number(item.quantity),
      0
    );
}

export function calculateDeliveryTotal(order: any) {
  if (!order?.order_items) return 0;

  return order.order_items
    .filter(
      (item: any) =>
        item.status?.toLowerCase() !== "cancelled"
    )
    .reduce(
      (total: number, item: any) =>
        total +
        Number(item.delivery_fee || 0),
      0
    );
}
