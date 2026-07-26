export const ORDER_STEPS = [
  "pending",
  "accepted",
  "processing",
  "packed",
  "shipped",
  "delivered",
];

export function stepReached(
  current: string,
  target: string
) {
  return (
    ORDER_STEPS.indexOf((current || "").toLowerCase()) >=
    ORDER_STEPS.indexOf(target)
  );
}

export function getOverallOrderStatus(order: any) {
  const statuses =
    order.order_items?.map((item: any) =>
      (item.status || "").toLowerCase()
    ) || [];

  const activeStatuses = statuses.filter(
    (s: string) => s !== "cancelled"
  );

  if (activeStatuses.length === 0) return "cancelled";

  if (activeStatuses.every((s: string) => s === "delivered"))
    return "delivered";

  if (activeStatuses.some((s: string) => s === "shipped"))
    return "shipped";

  if (activeStatuses.some((s: string) => s === "packed"))
    return "packed";

  if (activeStatuses.some((s: string) => s === "processing"))
    return "processing";

  if (activeStatuses.some((s: string) => s === "accepted"))
    return "accepted";

  return "pending";
}
