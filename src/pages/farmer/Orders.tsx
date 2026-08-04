import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Truck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import StatusBadge from "@/components/orders/StatusBadge";
import OrderCard from "@/components/orders/OrderCard";
import StatusSelect from "@/components/orders/StatusSelect";

type FarmerOrder = {
  order_id: string;
  order_item_id?: string;
  buyer_name: string | null;
buyer_phone: string | null;
shipping_cost: number;
total: number;
  delivery_address: string | null;
  created_at: string | null;
  status: string | null;
  farmer_id: string;
  name: string;
  images: string[] | null;
  quantity: number;
  unit: string;
  price: number;
};

export default function FarmerOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
  if (!user) {
    setOrders([]);
    setLoading(false);
    return;
  }

  console.log("Logged in user:", user.id);

  try {
    setLoading(true);

    const { data, error } = await (supabase as any).rpc("get_farmer_orders");

if (error) throw error;

setOrders((data ?? []) as FarmerOrder[]);
 
  } catch (error: any) {
    console.error(error);
    toast.error(error.message ?? "Unable to load orders.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrders();
  }, [user]);
  
const updateOrderStatus = async (
  orderItemId: string,
  newStatus: string
) => {
  try {
    const { data, error } = await (supabase as any).rpc(
  "update_farmer_order_status",
  {
    p_order_item_id: orderItemId,
    p_status: newStatus,
  }
);

if (error) throw error;

setOrders((current) =>
  current.map((order) =>
    order.order_item_id === orderItemId
      ? { ...order, status: newStatus }
      : order)
);

toast.success("Order status updated successfully.");

await fetchOrders();
    
  } catch (error: any) {
    console.error(error);
    toast.error(error.message ?? "Failed to update order.");
  }
};
  const getNextStatuses = (status: string) => {
  switch (status) {
    case "Pending":
      return ["Accepted", "Cancelled"];

    case "Accepted":
      return ["Processing", "Cancelled"];

    case "Processing":
      return ["Packed", "Cancelled"];

    case "Packed":
      return ["Shipped"];

    case "Shipped":
      return [];

    case "Delivered":
      return [];

    default:
      return [];
  }
};
  
  if (loading) {
  return <LoadingSpinner />;
  }

return (
  <div className="space-y-6 p-4 md:p-6 lg:p-8">
    <div>
      <h1 className="text-2xl font-bold">Manage Orders</h1>
      <p className="text-sm text-muted-foreground">
        Track and fulfill orders for your products
      </p>
    </div>

    <div className="space-y-6">
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>

          <CardTitle className="mb-2">
            No orders found
          </CardTitle>

          <CardContent>
            <p className="text-muted-foreground">
              You haven't received any orders yet. Once buyers purchase your
              products, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <OrderCard
  key={order.order_item_id ?? order.order_id}
  className="border-2"
>
            <CardHeader className="flex flex-col justify-between gap-4 border-b bg-muted/30 p-4 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-4 md:gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Order ID
                  </p>

                  <p className="text-sm font-medium">
                    #{order.order_id?.slice(0, 8) ?? "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Date
                  </p>

                  <p className="text-sm font-medium">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div className="text-right space-y-1">
  <p className="text-xs font-semibold uppercase text-muted-foreground">
    Customer
  </p>

  <p className="text-sm font-medium">
    {order.buyer_name ?? "Unknown"}
  </p>

  <p className="text-xs text-muted-foreground">
    {order.buyer_phone ?? "No phone"}
  </p>
</div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
  Item Total
</p>

<p className="text-sm font-medium text-primary">
  ₦
  {(
    Number(order.price) *
    Number(order.quantity)
  ).toLocaleString()}
</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
  <StatusSelect
  value={order.status ?? "Pending"}
  options={getNextStatuses(order.status ?? "Pending")}
  disabled={
    getNextStatuses(order.status ?? "Pending").length === 0
  }
  onChange={(value) => {
    updateOrderStatus(order.order_item_id, value);
  }}
/>
</div>
            </CardHeader>

         <CardContent className="p-4 md:p-6">
  <div className="space-y-4">
    <div className="flex gap-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {order.images?.[0] ? (
          <img
            src={order.images[0]}
            alt={order.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="font-semibold">
          {order.name}
        </h4>

        <p className="text-sm text-muted-foreground">
          Quantity: {order.quantity} {order.unit}
        </p>

        <p className="text-sm">
          ₦{Number(order.price ?? 0).toLocaleString()} each
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold text-primary">
          ₦
          {(
            Number(order.price ?? 0) *
            Number(order.quantity ?? 0)
          ).toLocaleString()}
        </p>
      </div>
    </div>
  </div>

  <div className="mt-6 flex flex-col justify-between gap-4 border-t pt-6 md:flex-row">
    <div className="flex items-start gap-2">
      <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />

      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Shipping Address
        </p>

        <p className="text-sm">
          {order.delivery_address ?? "No address provided"}</p>
        
      </div>
    </div>

    <div className="text-right">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        Customer Name
      </p>

      <p className="text-sm font-medium">
        {order.buyer_name ?? "Unknown"}
      </p>
    </div>
  </div>
</CardContent>
          </OrderCard>
        ))
      )}
    </div>
  </div>
);
}
