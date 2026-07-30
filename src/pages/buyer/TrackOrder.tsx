import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Package, Truck, CheckCircle2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { calculateProductSubtotal, calculateDeliveryTotal, calculateOrderTotal } from "@/lib/orderCalculations";

export default function TrackOrder() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
 const fetchOrder = async () => {
  if (!orderId) return;

  try {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("id", orderId)
      .single();

    if (error) throw error;

    setOrder(data);
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
  
  useEffect(() => {
        fetchOrder();
  }, [orderId]);

  if (loading) {
  return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="flex justify-center py-10">
        Order not found.
      </div>
    );
  }
  const confirmDelivery = async (orderItemId: string) => {
  try {
    const { data, error } = await (supabase as any).rpc(
  "confirm_order_delivery",
  {
    p_order_item_id: orderItemId,
  }
);

if (error) throw error;
toast.success("Order confirmed as delivered.");
await fetchOrder();
  } catch (error: any) {
    console.error(error);
    toast.error(error.message ?? "Unable to confirm delivery.");
  }
};
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <Button asChild variant="outline">
    <Link to="/buyer/orders">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Back to My Orders
    </Link>
  </Button>

  <Button asChild>
    <Link to="/products">
      <ShoppingBag className="mr-2 h-4 w-4" />
      Continue Shopping
    </Link>
  </Button>
</div>
      <Card>
        <CardHeader>
          <CardTitle>
            Track Order
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
  {order.order_items?.map((item: any) => (
    <div
      key={item.id}
      className="border rounded-lg p-4"
    >
      <div className="flex items-center gap-4">

        <img
          src={item.products?.images?.[0] || "/placeholder.svg"}
          alt={item.products?.name}
          className="h-14 w-14 rounded-md object-cover bg-muted md:h-16 md:w-16"
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
  <p className="font-bold text-primary">
    ₦{Number(item.price * item.quantity).toLocaleString()}
  </p>

  {item.status?.toLowerCase() !== "cancelled" && (
    <p className="text-xs text-muted-foreground">
      Delivery: ₦{Number(item.delivery_fee || 0).toLocaleString()}
    </p>
  )}
</div>

      </div>

      <OrderTimeline status={item.status} />
      
        {item.status?.toLowerCase() === "shipped" ? (
  <div className="mt-4 flex justify-end">
    <Button
      onClick={() => confirmDelivery(item.id)}
      className="bg-green-600 hover:bg-green-700"
    >
      Confirm Delivery
    </Button>
  </div>
) : item.status?.toLowerCase() === "delivered" ? (
  <div className="mt-4 flex justify-end">
    <span className="rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
      ✓ Delivery Confirmed
    </span>
  </div>
) : null}
      
    </div>
  ))}

          <div className="border-t pt-4 space-y-2">
  <p>
    <strong>Products:</strong>{" "}
    ₦{calculateProductSubtotal(order).toLocaleString()}
  </p>

  <p>
    <strong>Delivery:</strong>{" "}
    ₦{calculateDeliveryTotal(order).toLocaleString()}
  </p>

  <p className="text-lg font-bold">
    <strong>Total Payable:</strong>{" "}
    ₦{calculateOrderTotal(order).toLocaleString()}
  </p>
</div>
          
  <div className="border-t pt-4">
    <p>
      <strong>Delivery Address:</strong>
    </p>

    <p>{order.delivery_address}</p>
  </div>
</CardContent>
      </Card>
    </div>
  );
}
