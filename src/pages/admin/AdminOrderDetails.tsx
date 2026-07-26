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

    </div>
  );
}
