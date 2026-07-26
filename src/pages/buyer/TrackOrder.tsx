import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Package, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackOrder() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
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
const stepReached = (
  current: string,
  steps: string[],
  target: string
) => {
  return (
    steps.indexOf((current || "").toLowerCase()) >=
    steps.indexOf(target)
  );
};

const orderSteps = [
  "pending",
  "accepted",
  "processing",
  "packed",
  "shipped",
  "delivered",
];
  const confirmDelivery = async (orderItemId: string) => {
  try {
    const { error } = await (supabase as any).rpc(
      "update_farmer_order_status",
      {
        p_order_item_id: orderItemId,
        p_status: "Delivered",
      }
    );

    if (error) throw error;

    toast.success("Order confirmed as delivered.");

    fetchOrder();
  } catch (error: any) {
    console.error(error);
    toast.error(error.message ?? "Unable to confirm delivery.");
  }
};
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

      <div className="mt-4">
  <div className="flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-medium">

    <div className={`flex flex-col items-center ${
      stepReached(item.status, orderSteps, "pending")
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Clock className="h-4 w-4 mb-1" />
      <span>Pending</span>
    </div>

    <div className="flex-1 h-[2px] bg-border" />

    <div className={`flex flex-col items-center ${
      stepReached(item.status, orderSteps, "accepted")
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Package className="h-4 w-4 mb-1" />
      <span>Accepted</span>
    </div>

    <div className="flex-1 h-[2px] bg-border" />

    <div className={`flex flex-col items-center ${
      stepReached(item.status, orderSteps, "processing")
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Package className="h-4 w-4 mb-1" />
      <span>Processing</span>
    </div>

    <div className="flex-1 h-[2px] bg-border" />

    <div className={`flex flex-col items-center ${
      stepReached(item.status, orderSteps, "packed")
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Package className="h-4 w-4 mb-1" />
      <span>Packed</span>
    </div>

    <div className="flex-1 h-[2px] bg-border" />

    <div className={`flex flex-col items-center ${
      stepReached(item.status, orderSteps, "shipped")
        ? "text-primary"
        : "text-muted-foreground"
    }`}>
      <Truck className="h-4 w-4 mb-1" />
      <span>Shipped</span>
    </div>

    <div className="flex-1 h-[2px] bg-border" />

    <div className={`flex flex-col items-center ${
      stepReached(item.status, orderSteps, "delivered")
        ? "text-green-600"
        : "text-muted-foreground"
    }`}>
      <CheckCircle2 className="h-4 w-4 mb-1" />
      <span>Delivered</span>
    </div>

  </div>
</div>
        {item.status?.toLowerCase() === "shipped" && (
  <div className="mt-4 flex justify-end">
    <Button
      onClick={() => confirmDelivery(item.id)}
      className="bg-green-600 hover:bg-green-700"
    >
      Confirm Delivery
    </Button>
  </div>
)}
      
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
