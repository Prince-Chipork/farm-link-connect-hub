export function getOverallOrderStatus(order: any) {
  const statuses =
    order.order_items?.map((item: any) =>
      (item.status || "").toLowerCase()
    ) || [];

  if (statuses.length === 0) return "pending";

  if (statuses.every(s => s === "cancelled")) return "Cancelled";
  if (statuses.every(s => s === "delivered")) return "Delivered";
  if (statuses.every(s => s === "accepted")) return "Accepted";
  if (statuses.every(s => s === "processing")) return "Processing";
  if (statuses.every(s => s === "packed")) return "Packed";
  if (statuses.every(s => s === "shipped")) return "Shipped";

  return "Mixed";
}
