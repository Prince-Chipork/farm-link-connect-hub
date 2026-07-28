import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
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
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

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

  if (statuses.length === 0) return "pending";

  if (statuses.every((s) => s === "cancelled")) return "Cancelled";
  if (statuses.every((s) => s === "delivered")) return "Delivered";
  if (statuses.every((s) => s === "accepted")) return "Accepted";
  if (statuses.every((s) => s === "processing")) return "Processing";
  if (statuses.every((s) => s === "packed")) return "Packed";
  if (statuses.every((s) => s === "shipped")) return "Shipped";

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

      <div className="text-right">
        <p className="font-bold">
          ₦{Number(item.quantity * item.price).toLocaleString()}
        </p>

        <p className="text-sm text-muted-foreground">
          {item.status}
        </p>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}
