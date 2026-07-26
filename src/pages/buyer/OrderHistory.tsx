import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StatusBadge from "@/components/orders/StatusBadge"; 
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { getOverallOrderStatus } from "@/lib/orderStatus";
import type { Order } from "@/types";

type BuyerOrder = {
  id: string;
  buyer_id: string;
  total: number;
  status: string;
  delivery_address: string;
  shipping_cost: number;
  created_at: string;

  order_items: {
    id: string;
    quantity: number;
    price: number;
    status: string;

    products: {
      name: string;
      images: string[];
    };
  }[];
};

export default function BuyerOrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading) {
  return <LoadingSpinner />;
}
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button asChild variant="outline">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No orders found</CardTitle>
            <CardContent>
              <p className="text-muted-foreground">You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <Button asChild className="mt-4">
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order: BuyerOrder) => (
            <Card key={order.id} className="overflow-hidden border shadow-sm">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between space-y-0 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Order ID</p>
                    <p className="text-sm font-mono">#{order.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Date</p>
                    <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total</p>
                    <p className="text-sm font-medium text-primary font-bold">₦{Number(order.total || 0).toLocaleString()}</p>
                  </div>
                  <div>
  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
    Status
  </p>

  <div className="mt-1">
   <StatusBadge status={getOverallOrderStatus(order)} />
  </div>
</div>
                </div>
                <div className="flex flex-col items-end gap-2">
      
                  <Button
  asChild
  variant="ghost"
  size="sm"
  className="h-7 text-xs gap-1"
>
  <Link to={`/buyer/orders/${order.id}`}>
    <Eye className="h-3 w-3" />
    View Details
  </Link>
</Button>
        <Button
  asChild
  variant="outline"
  size="sm"
  className="h-7 text-xs"
>
  <Link to={`/buyer/orders/${order.id}/track`}>
    Track Order
  </Link>
</Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div
  key={item.id}
  className="border rounded-lg p-4 space-y-4"
> 
<div className="flex items-center gap-4">
                      <img
  src={item.products?.images?.[0] || "/placeholder.svg"}
  alt={item.products?.name}
  className="h-16 w-16 rounded-md object-cover bg-muted"
/>
                      <div className="flex-1">
  <h4 className="text-sm font-semibold">
    {item.products?.name}
  </h4>

  <p className="text-xs text-muted-foreground">
    Qty: {item.quantity} × ₦{Number(item.price).toLocaleString()}
  </p>

  <div className="mt-2">
    <StatusBadge status={item.status} />
  </div>
</div>

<div className="text-right">
  <p className="font-bold text-primary">
    ₦{Number(item.quantity * item.price).toLocaleString()}
  </p>
</div>

</div>

</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
