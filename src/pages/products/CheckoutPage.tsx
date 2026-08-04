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

