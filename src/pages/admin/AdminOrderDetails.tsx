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
      
      <h2 className="mt-8 mb-3 text-lg font-semibold">
  Ordered Products
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
