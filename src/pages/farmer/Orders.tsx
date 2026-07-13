import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag, Truck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type FarmerOrder = {
  order_id: string;
  order_item_id?: string;
  buyer_name: string | null;
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

    setOrders((data || []) as FarmerOrder[]);
 console.log("Orders returned:", data);
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
    orderId: string,
    newStatus: string
  ) => {
    try {
      const { data, error } = await supabase
  .from("orders")
  .update({
    status: newStatus,
  })
  .eq("id", orderId)
  .select();

      if (error) {
  throw error;
}

console.log("Updated rows:", data);

if (!data || data.length === 0) {
  toast.error("No rows were updated.");
  return;
}

      setOrders((current) =>
        current.map((order) =>
          order.order_id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast.success("Order status updated successfully.");

      await fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message ?? "Failed to update order status.");
    }
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Accepted: "bg-blue-100 text-blue-700",
    Processing: "bg-indigo-100 text-indigo-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
  return (
    <div className="flex justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
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
          <Card
            key={order.order_item_id ?? order.order_id}
            className="overflow-hidden border-2"
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

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Customer
                  </p>

                  <p className="text-sm font-medium">
                    {order.buyer_name ?? "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Total for you
                  </p>

                  <p className="text-sm font-medium text-primary">
                    ₦
                    {(
                      Number(order.price ?? 0) *
                      Number(order.quantity ?? 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={`${
                    statusColors[order.status ?? "Pending"]
                  } border-none px-3 py-1`}
                >
                  {order.status ?? "Pending"}
                </Badge>

                <Select
                  value={order.status ?? "Pending"}
                  onValueChange={(value) => {
                    if (!order.order_id) {
                      toast.error("Order ID is missing.");
                      return;
                    }

                    updateOrderStatus(order.order_id, value);
                  }}
                >
                  <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>

                    <SelectItem value="Accepted">
                      Accepted
                    </SelectItem>

                    <SelectItem value="Processing">
                      Processing
                    </SelectItem>

                    <SelectItem value="Shipped">
                      Shipped
                    </SelectItem>

                    <SelectItem value="Delivered">
                      Delivered
                    </SelectItem>

                    <SelectItem value="Cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
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
          {order.delivery_address ?? "No address provided"}
        </p>
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
          </Card>
        ))
      )}
    </div>
  </div>
);
}
