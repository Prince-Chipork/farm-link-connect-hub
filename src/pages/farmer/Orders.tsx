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

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("farmer_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOrders((data ?? []) as FarmerOrder[]);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
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
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
        })
        .eq("id", orderId);

      if (error) {
        throw error;
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
      <div className="p-4 md:p-6 lg:p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Orders</h1>
        <p className="text-muted-foreground text-sm">Track and fulfill orders for your products</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No orders found</CardTitle>
            <CardContent>
              <p className="text-muted-foreground">You haven't received any orders yet. Once buyers purchase your products, they will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
  key={order.order_item_id ?? order.order_id}
  className="overflow-hidden border-2"
>
              <CardHeader className="bg-muted/30 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                <div className="flex gap-4 md:gap-8 flex-wrap">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Order ID</p>
                    <p className="text-sm font-medium">#{order.order_id?.slice(0, 8) ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Date</p>
                    <p className="text-sm font-medium">
  {order.created_at
    ? new Date(order.created_at).toLocaleDateString()
    : "-"}
</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Customer</p>
                    <p className="text-sm font-medium">{order.buyer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Total for you</p>
                    <p className="text-sm font-medium text-primary">
                      ₦{(Number(order.price ?? 0) * Number(order.quantity ?? 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={`${statusColors[order.status ||"Pending"]} border-none px-3 py-1`}>
                    {order.status ?? "Pending"}
                  </Badge>
                  <Select
  value={order.status ?? "Pending"}
  onValueChange={(value) => {
  toast.info(`Farmer ID: ${order.farmer_id}`);
  toast.info(`Order ID: ${order.order_id}`);

  if (!order.order_id) {
    toast.error("Order ID is missing");
    return;
  }

  updateOrderStatus(order.order_id, value);
}}
>
  <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
  <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
    {order.images?.[0] ? (
      <img
  src={order.images?.[0]}
  alt={order.name}
  className="w-full h-full object-cover"
/>
    ) : (
      <div className="w-full h-full flex items-center justify-center">
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
      ₦{Number(order.price).toLocaleString()} each
    </p>
  </div>

  <div className="text-right">
    <p className="font-bold text-primary">
      ₦{(order.price * order.quantity).toLocaleString()}
    </p>
  </div>
</div>      
                </div>              
                  
             <div className="mt-6 pt-6 border-t flex flex-col md:flex-row gap-4 justify-between">
                   <div className="flex items-start gap-2">
                     <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                     <div>
                       <p className="text-xs text-muted-foreground font-semibold uppercase">Shipping Address</p>
                       <p className="text-sm">{order.delivery_address ?? "No address"}</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
  Customer Name
</p>
<p className="text-sm font-medium">
{order.buyer_name}
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
  
