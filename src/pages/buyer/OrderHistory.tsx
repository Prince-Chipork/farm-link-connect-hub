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
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Shipped</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Eye className="h-3 w-3" /> View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img 
                        src={item.products?.image_url || '/placeholder.svg'} 
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
