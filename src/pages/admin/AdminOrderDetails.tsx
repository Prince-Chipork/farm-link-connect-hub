import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminOrderDetails() {
  const { orderId } = useParams();

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
          farmer:profiles!orders_farmer_id_fkey(full_name),
          order_items(
            *,
            products(*)
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
  const { error } = await supabase
    .from("order_items")
    .update({
      status,
    })
    .eq("id", itemId);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Item status updated.");

  setOrder({
    ...order,
    order_items: order.order_items.map((item: any) =>
      item.id === itemId
        ? { ...item, status }
        : item
    ),
  });
};
  
  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="container mx-auto py-8">
        Order not found.
      </div>
    );
  }

  const getOverallOrderStatus = (order: any) => {
  const statuses =
    order.order_items?.map((item: any) =>
      (item.status || "").toLowerCase()
    ) || [];

  if (statuses.length === 0) return "Pending";

  if (statuses.every((s) => s === "Cancelled")) return "Cancelled";
  if (statuses.every((s) => s === "Delivered")) return "Delivered";
  if (statuses.every((s) => s === "Accepted")) return "Accepted";
  if (statuses.every((s) => s === "Processing")) return "Processing";
  if (statuses.every((s) => s === "Packed")) return "Packed";
  if (statuses.every((s) => s === "Shipped")) return "Shipped";

  return "Mixed";
};
  
  return (
    <div className="container mx-auto py-8">

      <h1 className="text-2xl font-bold">
        Order Details
      </h1>

      <p className="mt-4">
        Buyer: {order.buyer?.full_name}
      </p>

      <p>
        Farmer: {order.farmer?.full_name}
      </p>

      <p>
        Total: ₦{Number(order.total).toLocaleString()}
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
    <strong>Shipping Cost:</strong>{" "}
    ₦{Number(order.shipping_cost || 0).toLocaleString()}
  </p>

  <strong>Overall Status:</strong> {getOverallOrderStatus(order)}

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

  <Select
  value={itemStatuses[item.id]}
  onValueChange={(value) =>
    setItemStatuses((prev) => ({
      ...prev,
      [item.id]: value,
    }))
  }
>
    
    <SelectTrigger className="w-[170px]">
      <SelectValue />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="Pending">Pending</SelectItem>
      <SelectItem value="Accepted">Accepted</SelectItem>
      <SelectItem value="Processing">Processing</SelectItem>
      <SelectItem value="Packed">Packed</SelectItem>
      <SelectItem value="Shipped">Shipped</SelectItem>
      <SelectItem value="Delivered">Delivered</SelectItem>
      <SelectItem value="Cancelled">Cancelled</SelectItem>
    </SelectContent>
  </Select>

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
