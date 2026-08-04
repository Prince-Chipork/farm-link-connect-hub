import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import StatusSelect from "@/components/orders/StatusSelect";
import { getOverallOrderStatus } from "@/lib/orderStatus";
import { calculateOrderTotal, calculateProductSubtotal, calculateDeliveryTotal } from "@/lib/orderCalculations";
import OrderTimeline from "@/components/orders/OrderTimeline";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itemStatuses, setItemStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`*,
          buyer:profiles!orders_buyer_id_fkey(full_name),
          order_items(
            *,
            products(*, farmer:profiles!products_farmer_id_fkey(full_name)
            )
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) {
        toast.error(error.message);
      } else {
        setOrder(data);

const initialStatuses: Record<string, string> = {};

data.order_items?.forEach((item: any) => {
  initialStatuses[item.id] = item.status;
});

setItemStatuses(initialStatuses);
      }

      setLoading(false);
    };
 
    fetchOrder();
  }, [orderId]);

  const updateItemStatus = async (
  itemId: string,
  status: string
) => {
  // Update the selected order item
  const { error } = await supabase
    .from("order_items")
    .update({ status })
    .eq("id", itemId);

  if (error) {
    toast.error(error.message);
    return;
  }

  // Update local state
  const updatedOrder = {
    ...order,
    order_items: order.order_items.map((item: any) =>
      item.id === itemId
        ? { ...item, status }
        : item
    ),
  };

  setOrder(updatedOrder);

  // Calculate overall order status
  const overallStatus = getOverallOrderStatus(updatedOrder);

  const newStatus =
    overallStatus.charAt(0).toUpperCase() +
    overallStatus.slice(1);

  // Save overall status to orders table
  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", order.id);

  if (orderError) {
    toast.error(orderError.message);
    return;
  }

  toast.success("Order status updated successfully.");
};
  
  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        Order not found.
      </div>
    );
  }
  const payableTotal =
  order.order_items?.reduce((sum: number, item: any) => {
    if ((item.status || "").toLowerCase() === "cancelled") {
      return sum;
    }

    return sum + item.price * item.quantity;
  }, 0) ?? 0;
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
  <Button
    variant="outline"
    onClick={() => navigate("/admin/orders")}
  >
  ← Back to Orders
  </Button>
</div>

      <h1 className="text-2xl font-bold">
        Order Details
      </h1>

      <p className="mt-4">
        Buyer: {order.buyer?.full_name}
      </p>

      <p>
  Total: ₦{calculateOrderTotal(order).toLocaleString()}
</p>
      <div className="mt-6 space-y-2 rounded-lg border p-4 bg-muted/20">

  <p>
    <strong>Order Date:</strong>{" "}
    {new Date(order.created_at).toLocaleString()}
  </p>

  <p>
    <strong>Delivery Address:</strong>{" "}
    {order.delivery_address}
  </p>

  <p>
  <strong>Products:</strong>{" "}
  ₦{calculateProductSubtotal(order).toLocaleString()}
</p>

<p>
  <strong>Delivery:</strong>{" "}
  ₦{calculateDeliveryTotal(order).toLocaleString()}
</p>

<p className="font-bold">
  <strong>Total:</strong>{" "}
  ₦{calculateOrderTotal(order).toLocaleString()}
</p>

  <strong>Overall Status:</strong> {getOverallOrderStatus(order)}
        <OrderTimeline
  status={getOverallOrderStatus(order)}
/>

</div>
      
      <h2 className="mt-8 mb-3 text-lg font-semibold">
  Ordered Products ({order.order_items?.length ?? 0})
</h2>

<div className="space-y-4">
  {order.order_items?.map((item: any) => (
    <div
      key={item.id}
      className="flex items-center gap-4 rounded-lg border p-4"
    >
      <img
        src={item.products?.images?.[0] || "/placeholder.svg"}
        alt={item.products?.name}
        className="h-16 w-16 rounded-md object-cover"
      />

      <div className="flex-1">
        
        <h3 className="font-semibold">
          {item.products?.name}
        </h3>

        <p className="text-sm text-muted-foreground">
  Farmer: {item.products?.farmer?.full_name}
</p>
       
        <p className="text-sm text-muted-foreground">
          Qty: {item.quantity}
        </p>

        <p className="text-sm">
          ₦{Number(item.price).toLocaleString()} each
        </p>
      </div>

      <div className="text-right space-y-3">

  <p className="font-bold">
    ₦{Number(item.quantity * item.price).toLocaleString()}
  </p>

  <StatusSelect
  value={itemStatuses[item.id]}
  options={[
    "Pending",
    "Accepted",
    "Processing",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]}
  onChange={(value) =>
    setItemStatuses((prev) => ({
      ...prev,
      [item.id]: value,
    }))
  }
/>
        
  <Button
  size="sm"
  variant="outline"
  onClick={() =>
    updateItemStatus(
      item.id,
      itemStatuses[item.id]
    )
  }
>
  Save
</Button>

</div>
    </div>
  ))}
</div>
    </div>
  );
}
