import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import {
  ArrowLeft,
  CreditCard,
  Truck,
  ShieldCheck,
  Package,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";

import { createNotification } from "@/lib/notifications";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [deliveryOptions, setDeliveryOptions] =
    useState<Record<string, any[]>>({});

  const [selectedDelivery, setSelectedDelivery] =
    useState<Record<string, any>>({});

  const [address, setAddress] = useState("");

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);
    useEffect(() => {
    const loadDeliveryOptions = async () => {
      const productIds = cart.map((item) => item.id);

      if (!productIds.length) return;

      const { data, error } = await supabase
        .from("delivery_options")
        .select("*")
        .in("product_id", productIds)
        .eq("is_active", true);

      if (error) {
        toast.error(error.message);
        return;
      }

      const grouped: Record<string, any[]> = {};

      data.forEach((option: any) => {
        if (!grouped[option.product_id]) {
          grouped[option.product_id] = [];
        }

        grouped[option.product_id].push(option);
      });

      setDeliveryOptions(grouped);
    };

    loadDeliveryOptions();
  }, [cart]);
    const shippingCost = Object.values(selectedDelivery).reduce(
    (sum: number, option: any) =>
      sum + Number(option.delivery_fee || 0),
    0
  );

  const totalAmount = cartTotal + shippingCost;
    const paystackConfig = {
    reference: `${Date.now()}`,
    email: user?.email ?? "",
    amount: totalAmount * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment =
    usePaystackPayment(paystackConfig);

const verifyPayment = async (reference: any) => {
  try {
    toast.loading("Verifying payment...", {
      id: "verify-payment",
    });

    const paymentReference =
      reference.reference || reference.trxref;

    const response = await fetch(
      "https://tqsozciafuxrxumnxkjr.supabase.co/functions/v1/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: paymentReference,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      toast.error(
        result.message || "Payment verification failed.",
        {
          id: "verify-payment",
        }
      );
      return;
    }

    toast.success("Payment verified.", {
      id: "verify-payment",
    });

    await handlePlaceOrder(
      result.reference,
      result.payment_status,
      result.paid_at
    );
  } catch (error) {
    console.error(error);

    toast.error("Unable to verify payment.", {
      id: "verify-payment",
    });
  }
};

const handleCheckout = () => {
  if (!user) {
    toast.error("Please log in first.");
    return;
  }

  if (cart.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }

  if (!address.trim()) {
    toast.error("Please enter your delivery address.");
    return;
  }

  const missingDelivery = cart.some(
    (item) => !selectedDelivery[item.id]
  );

  if (missingDelivery) {
    toast.error(
      "Please select a delivery method for every product."
    );
    return;
  }

  initializePayment({
    onSuccess: verifyPayment,
    onClose: () => {
      toast.info("Payment cancelled.");
    },
  });
};

useEffect(() => {

  const loadDeliveryOptions = async () => {

    if (cart.length === 0) return;

    const ids = cart.map((item) => item.id);

    const { data, error } = await supabase
      .from("delivery_options")
      .select("*")
      .in("product_id", ids)
      .eq("is_active", true);

    if (error) {
      toast.error(error.message);
      return;
    }

    const grouped: Record<string, any[]> = {};

    data.forEach((option) => {

      if (!grouped[option.product_id]) {
        grouped[option.product_id] = [];
      }

      grouped[option.product_id].push(option);

    });

    setDeliveryOptions(grouped);

  };

  loadDeliveryOptions();

}, [cart]);
  const shippingCost = Object.values(selectedDelivery).reduce(
  (sum: number, option: any) =>
    sum + Number(option.delivery_fee || 0),
  0
);

const totalAmount = cartTotal + shippingCost;

const paystackConfig = {

  email: user?.email ?? "",

  amount: totalAmount * 100,

  publicKey:
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,

  text: `Pay ₦${totalAmount.toLocaleString()}`,

};

const initializePayment =
  usePaystackPayment(paystackConfig);
  const verifyPayment = async (reference: any) => {
  toast.loading("Verifying payment...", {
    id: "verify-payment",
  });

  try {
    const paymentReference =
      reference.reference || reference.trxref;

    const response = await fetch(
      "https://tqsozciafuxrxumnxkjr.supabase.co/functions/v1/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: paymentReference,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      toast.error(
        result.message || "Payment verification failed.",
        {
          id: "verify-payment",
        }
      );

      return;
    }

    toast.success("Payment verified.", {
      id: "verify-payment",
    });

    await handlePlaceOrder(
      result.reference,
      result.payment_status,
      result.paid_at
    );

  } catch (err) {

    toast.error("Unable to verify payment.", {
      id: "verify-payment",
    });

  }
};
  const handleCheckout = () => {

  if (!user) {
    toast.error("Please login first.");
    return;
  }

  if (cart.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }

  if (!firstName.trim()) {
    toast.error("Enter first name.");
    return;
  }

  if (!lastName.trim()) {
    toast.error("Enter last name.");
    return;
  }

  if (!phone.trim()) {
    toast.error("Enter phone number.");
    return;
  }

  if (!city.trim()) {
    toast.error("Enter city.");
    return;
  }

  if (!state.trim()) {
    toast.error("Enter state.");
    return;
  }

  if (!address.trim()) {
    toast.error("Enter delivery address.");
    return;
  }

  const missingDelivery = cart.some(
    (item) => !selectedDelivery[item.id]
  );

  if (missingDelivery) {
    toast.error(
      "Select a delivery option for every product."
    );
    return;
  }

  if (paymentMethod === "cod") {
    handlePlaceOrder(
      "",
      "pending",
      ""
    );
    return;
  }

  initializePayment(
    verifyPayment,
    () => toast.info("Payment cancelled.")
  );

};
  const handlePlaceOrder = async (
  paymentReference: string,
  paymentStatus: string,
  paidAt: string
) => {

  if (!user) return;

  setIsProcessing(true);

  try {

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .insert({

          buyer_id: user.id,

          total: totalAmount,

          delivery_address: address,

          shipping_cost: shippingCost,

          payment_reference: paymentReference,

          payment_status: paymentStatus,

          paid_at: paidAt,

          status: "Pending",

        })
        .select()
        .single();

    if (orderError) throw orderError;

    const items = cart.map((item) => ({

      order_id: orderData.id,

      product_id: item.id,

      farmer_id: item.farmer_id,

      quantity: item.quantity,

      price: item.price,

      delivery_fee:
        selectedDelivery[item.id]?.delivery_fee ?? 0,

    }));

    const { error: itemError } =
      await (supabase as any)
        .from("order_items")
        .insert(items);

    if (itemError) throw itemError;
        // Notify buyer
    await createNotification({
      userId: user.id,
      title: "Order Placed Successfully",
      message: `Your order #${orderData.id.slice(0, 8)} has been placed successfully.`,
      type: "new_order",
      link: `/buyer/orders/${orderData.id}/track`,
      metadata: {
        order_id: orderData.id,
      },
    });

    // Notify every farmer
    const uniqueFarmers = [
      ...new Set(items.map((item) => item.farmer_id)),
    ];

    for (const farmerId of uniqueFarmers) {
      await createNotification({
        userId: farmerId,
        title: "New Order Received",
        message: "You have received a new order from a buyer.",
        type: "new_order",
        link: "/farmer/orders",
        metadata: {
          order_id: orderData.id,
        },
      });
    }

    clearCart();

    setIsSuccess(true);

    toast.success("Order placed successfully!");

  } catch (error: any) {

    toast.error(error.message);

  } finally {

    setIsProcessing(false);

  }

};
  if (isSuccess) {
  return (
    <div className="container mx-auto max-w-lg px-4 py-20 text-center">

      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="mb-4 text-3xl font-bold">
        Order Successful!
      </h1>

      <p className="mb-8 text-muted-foreground">
        Your order has been placed successfully.
      </p>

      <div className="space-y-3">

        <Button asChild className="w-full">
          <Link to="/buyer/orders">
            Track My Order
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full"
        >
          <Link to="/products">
            Continue Shopping
          </Link>
        </Button>

      </div>

    </div>
  );
  }

