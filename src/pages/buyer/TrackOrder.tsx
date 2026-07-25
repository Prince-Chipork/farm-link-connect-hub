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
          className="h-16 w-16 rounded-md object-cover bg-muted"
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
        </div>

      </div>
    </div>
  ))}

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
