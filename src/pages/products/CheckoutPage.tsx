import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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
  ShoppingBag,
  ShieldCheck,
  Package,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";
import { usePaystackPayment } from "react-paystack";

import { createNotification } from "@/lib/notifications";

export default function CheckoutPage() {

  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("paystack");

  const [deliveryOptions, setDeliveryOptions] =
    useState<Record<string, any[]>>({});

  const [selectedDelivery, setSelectedDelivery] =
    useState<Record<string, any>>({});

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

  initializePayment({
  onSuccess: verifyPayment,
  onClose: () => {
    toast.info("Payment cancelled.");
  },
});

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

return (
  <div className="container mx-auto max-w-6xl px-4 py-8">

    <Link
      to="/products"
      className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back to Shopping
    </Link>

    <h1 className="mb-8 text-3xl font-bold">
      Checkout
    </h1>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

      {/* LEFT SIDE */}

      <div className="space-y-6 lg:col-span-2">

        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Delivery Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2">

              <div>
                <Label>First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                />
              </div>

            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <Label>City</Label>
                <Input
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>State</Label>
                <Input
                  value={state}
                  onChange={(e) =>
                    setState(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />
              </div>

            </div>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>

          <CardContent>

            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >

              <div className="flex items-center gap-3 border rounded-lg p-4">

                <RadioGroupItem
                  value="paystack"
                  id="paystack"
                />

                <Label htmlFor="paystack">
                  Paystack
                </Label>

              </div>

              <div className="mt-3 flex items-center gap-3 border rounded-lg p-4">

                <RadioGroupItem
                  value="cod"
                  id="cod"
                />

                <Label htmlFor="cod">
                  Pay on Delivery
                </Label>

              </div>

            </RadioGroup>

          </CardContent>

        </Card>

      </div>

      {/* RIGHT SIDE */}

      <div>

        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order Summary
            </CardTitle>
          </CardHeader>

          <CardContent>

            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-5 border-b pb-4"
              >

                <div className="flex justify-between">

                  <div>

                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>

                  </div>

                  <strong>
                    ₦
                    {(item.price * item.quantity).toLocaleString()}
                  </strong>

                </div>

                <div className="mt-3">

                  <Label>
                    Delivery Option
                  </Label>

                  <select
                    className="mt-1 w-full rounded-md border p-2"
                    value={
                      selectedDelivery[item.id]?.id || ""
                    }
                    onChange={(e) => {

                      const option =
                        deliveryOptions[item.id]?.find(
                          (o) =>
                            o.id === e.target.value
                        );

                      if (!option) return;

                      setSelectedDelivery((prev) => ({
                        ...prev,
                        [item.id]: option,
                      }));

                    }}
                  >

                    <option value="">
                      Select Delivery
                    </option>

                    {(deliveryOptions[item.id] || []).map(
                      (option) => (
                        <option
                          key={option.id}
                          value={option.id}
                        >
                          {option.option_name} -
                          ₦
                          {Number(
                            option.delivery_fee
                          ).toLocaleString()}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>
            ))}

            <Separator className="my-4" />

            <div className="space-y-2">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  ₦{shippingCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>

            </div>

          </CardContent>

          <CardFooter className="flex-col gap-3">

            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing
                ? "Processing..."
                : `Pay ₦${totalAmount.toLocaleString()}`}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Secure Checkout
            </div>

          </CardFooter>

        </Card>

        <div className="mt-6 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">

          <p className="mb-2 flex items-center gap-2 font-bold text-foreground">

            <Package className="h-4 w-4" />

            FarmLink Escrow Protection

          </p>

          Your payment is securely held until your order is delivered successfully.

        </div>

      </div>

    </div>

  </div>
);
              }
