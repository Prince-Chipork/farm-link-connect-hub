import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, Clock, XCircle, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function BuyerOrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
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

const getStatusBadge = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Pending
        </Badge>
      );

    case "accepted":
      return (
        <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white">
          Accepted
        </Badge>
      );

    case "processing":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
          Processing
        </Badge>
      );

    case "packed":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
          Packed
        </Badge>
      );

    case "shipped":
      return (
        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Shipped
        </Badge>
      );

    case "delivered":
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          Delivered
        </Badge>
      );

    case "cancelled":
      return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );

    default:
      return (
        <Badge variant="outline">
          {status || "Pending"}
        </Badge>
      );
  }
};

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
          orders.map((order) => (
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
                  <div className="hidden md:block">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Ship To</p>
                    <p className="text-sm font-medium truncate max-w-[150px]">{order.delivery_address || 'Home Address'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(order.status)}
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
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="mb-6">
  <div className="flex items-center justify-between text-xs font-medium">

    <div className={`flex flex-col items-center ${
      ["pending","accepted","processing","packed","shipped","delivered"]
        .includes((order.status || "").toLowerCase())
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Clock className="h-4 w-4 mb-1" />
      <span>Placed</span>
    </div>

    <div className="flex-1 h-[2px] bg-border mx-2"></div>

    <div className={`flex flex-col items-center ${
      ["accepted","processing","packed","shipped","delivered"]
        .includes((order.status || "").toLowerCase())
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Package className="h-4 w-4 mb-1" />
      <span>Packed</span>
    </div>

    <div className="flex-1 h-[2px] bg-border mx-2"></div>

    <div className={`flex flex-col items-center ${
      ["shipped","delivered"]
        .includes((order.status || "").toLowerCase())
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Truck className="h-4 w-4 mb-1" />
      <span>Shipped</span>
    </div>

    <div className="flex-1 h-[2px] bg-border mx-2"></div>

    <div className={`flex flex-col items-center ${
      (order.status || "").toLowerCase() === "delivered"
        ? "text-green-600"
        : "text-muted-foreground"
    }`}>
      <CheckCircle2 className="h-4 w-4 mb-1" />
      <span>Delivered</span>
    </div>

  </div>
</div>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
  src={item.products?.images?.[0] || "/placeholder.svg"}
  alt={item.products?.name}
  className="h-16 w-16 rounded-md object-cover bg-muted"
/>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{item.products?.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₦{Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold">
                        ₦{Number((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                      </p>
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
