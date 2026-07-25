import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function TrackOrder() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

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

      if (error) {
        toast.error(error.message);
      } else {
        setOrder(data);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        Loading...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center py-10">
        Order not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Track Order
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            Order ID: {order.id}
          </p>

          <p>
            Total: ₦{Number(order.total).toLocaleString()}
          </p>

          <p>
            Delivery Address: {order.delivery_address}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
