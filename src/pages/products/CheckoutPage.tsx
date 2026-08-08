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
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentStatusUnknown, setPaymentStatusUnknown] = useState(false);
  const [initializedOrderId, setInitializedOrderId] = useState("");
  const [pendingOrderId, setPendingOrderId] =useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const [deliveryOptions, setDeliveryOptions] = useState<Record<string, any[]>>({});

  const [selectedDelivery, setSelectedDelivery] = useState<Record<string, any>>({});

  /*
   * ---------------------------------------------------------
   * LOAD DELIVERY OPTIONS
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * CALCULATE SHIPPING AND TOTAL
   * ---------------------------------------------------------
   */

  const shippingCost = Object.values(
    selectedDelivery
  ).reduce(
    (sum: number, option: any) =>
      sum + Number(option.delivery_fee || 0),
    0
  );

  const totalAmount = cartTotal + shippingCost;

  /*
   * ---------------------------------------------------------
   * INITIALIZE ORDER
   * ---------------------------------------------------------
   *
   * The order is created BEFORE Paystack opens.
   *
   * This means that if payment succeeds but the browser
   * loses connection afterwards, the order still exists
   * in Supabase and can be recovered.
   */

  const initializeOrder = async (
    reference: string
  ) => {
    if (!user) {
      throw new Error(
        "You must be logged in."
      );
    }

    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,

          total: totalAmount,

          delivery_address: address,

          shipping_cost: shippingCost,

          payment_reference: reference,

          payment_status: "pending",

          paid_at: null,

          status: "Pending",
        })
        .select()
        .single();

    if (orderError) {
      throw orderError;
    }

    /*
     * Create all order items.
     */

    const items = cart.map((item) => ({
      order_id: orderData.id,

      product_id: item.id,

      farmer_id: item.farmer_id,

      quantity: item.quantity,

      price: item.price,

      delivery_fee:
        selectedDelivery[item.id]
          ?.delivery_fee ?? 0,
    }));

    const { error: itemError } =
      await (supabase as any)
        .from("order_items")
        .insert(items);

    if (itemError) {
      /*
       * Payment has NOT started yet.
       *
       * Therefore it is safe to remove the incomplete
       * order if its items could not be created.
       */

      await supabase
        .from("orders")
        .delete()
        .eq("id", orderData.id);

      throw itemError;
    }

    return {
      orderId: orderData.id,

      paymentReference: reference,
    };
  };

  /*
   * ---------------------------------------------------------
   * VERIFY PAYMENT
   * ---------------------------------------------------------
   *
   * Paystack calls this after successful payment.
   *
   * The Edge Function performs the actual server-side
   * verification.
   *
   * IMPORTANT:
   *
   * We DO NOT INSERT ANOTHER ORDER here.
   *
   * The existing order created by initializeOrder()
   * is the order that gets completed.
   */

  const verifyPayment = async (reference: any) => {
  const referenceValue =
    reference.reference || reference.trxref;

  if (!referenceValue) {
    toast.error("Payment reference was not received.");
    return;
  }

  if (!initializedOrderId) {
    toast.error(
      "Your order could not be identified. Please do not pay again."
    );
    return;
  }

  setPaymentReference(referenceValue);
  setPaymentStatusUnknown(false);

  toast.loading("Verifying payment...", {
    id: "verify-payment",
  });

  try {
    const response = await fetch(
      "https://tqsozciafuxrxumnxkjr.supabase.co/functions/v1/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: initializedOrderId,
          reference: referenceValue,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      toast.error(
        result.message ||
          "Payment verification failed.",
        {
          id: "verify-payment",
        }
      );

      return;
    }

    toast.success("Payment verified successfully.", {
      id: "verify-payment",
    });

    await handlePlaceOrder(
      result.orderId,
      result.reference,
      result.payment_status,
      result.paid_at
    );

  } catch (err) {

    console.error(
      "Payment verification error:",
      err
    );

    setPaymentStatusUnknown(true);

    toast.error(
      "We couldn't confirm your payment because of a network problem. Your order has been saved and can be recovered. Please do not pay again.",
      {
        id: "verify-payment",
        duration: 10000,
      }
    );
  }
};

  /*
   * ---------------------------------------------------------
   * PAYSTACK CONFIGURATION
   * ---------------------------------------------------------
   *
   * This is created after the payment reference has been
   * generated and stored in state.
   */

  const paystackConfig = {
    email: user?.email ?? "",

    amount: totalAmount * 100,

    publicKey:
      import.meta.env
        .VITE_PAYSTACK_PUBLIC_KEY,

    text: `Pay ₦${totalAmount.toLocaleString()}`,

    reference:
      paymentReference || undefined,
  };

  const initializePayment =
    usePaystackPayment(
      paystackConfig
    );

  /*
   * ---------------------------------------------------------
   * CHECKOUT
   * ---------------------------------------------------------
   */

  const handleCheckout =
    async () => {
      if (!user) {
        toast.error(
          "Please login first."
        );
        return;
      }

      if (cart.length === 0) {
        toast.error(
          "Your cart is empty."
        );
        return;
      }

      if (!firstName.trim()) {
        toast.error(
          "Enter first name."
        );
        return;
      }

      if (!lastName.trim()) {
        toast.error(
          "Enter last name."
        );
        return;
      }

      if (!phone.trim()) {
        toast.error(
          "Enter phone number."
        );
        return;
      }

      if (!city.trim()) {
        toast.error(
          "Enter city."
        );
        return;
      }

      if (!state.trim()) {
        toast.error(
          "Enter state."
        );
        return;
      }

      if (!address.trim()) {
        toast.error(
          "Enter delivery address."
        );
        return;
      }

      const missingDelivery =
        cart.some(
          (item) =>
            !selectedDelivery[
              item.id
            ]
        );

      if (missingDelivery) {
        toast.error(
          "Select a delivery option for every product."
        );
        return;
      }

      /*
       * -----------------------------------------------------
       * GENERATE ONE FARM LINK REFERENCE
       * -----------------------------------------------------
       *
       * This reference belongs to this checkout attempt.
       */

      const reference =
        `FL-${crypto.randomUUID()}`;

      setPaymentReference(
        reference
      );

      setPaymentStatusUnknown(
        false
      );

      /*
       * -----------------------------------------------------
       * PAY ON DELIVERY
       * -----------------------------------------------------
       */

      if (
        paymentMethod === "cod"
      ) {
        try {
          setIsProcessing(true);

          const {
            orderId,
          } =
            await initializeOrder(
              reference
            );

          setPendingOrderId(
            orderId
          );

          /*
           * COD does not require Paystack.
           *
           * The order remains Pending.
           */

          clearCart();

          setIsSuccess(true);

          toast.success(
            "Order placed successfully!"
          );

        } catch (
          error: any
        ) {
          console.error(
            "Order initialization error:",
            error
          );

          toast.error(
            error.message ||
              "Unable to initialize your order."
          );
        } finally {
          setIsProcessing(
            false
          );
        }

        return;
      }

      /*
       * -----------------------------------------------------
       * PAYSTACK
       * -----------------------------------------------------
       */

      try {
        setIsProcessing(true);

        /*
         * Create the database order BEFORE payment.
         */

        const { orderId, paymentReference } =
  await initializeOrder(reference);

setInitializedOrderId(orderId);
setPaymentReference(paymentReference);

console.log(
  "FarmLink order initialized:",
  orderId
);

console.log(
  "FarmLink payment reference:",
  paymentReference
);

setIsProcessing(false);

        /*
         * Open Paystack.
         */

        initializePayment({
          onSuccess:
            verifyPayment,

          onClose: () => {
            setPaymentStatusUnknown(
              true
            );

            toast.warning(
              "Payment window closed. Your order has been saved and can be recovered if payment was completed.",
              {
                duration: 10000,
              }
            );
          },
        });

      } catch (
        error: any
      ) {
        console.error(
          "Order initialization error:",
          error
        );

        setIsProcessing(
          false
        );

        toast.error(
          error.message ||
            "Unable to initialize your order."
        );
      }
    };
    /*
   * ---------------------------------------------------------
   * SUCCESS SCREEN
   * ---------------------------------------------------------
   */

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

          <Button
            asChild
            className="w-full"
          >
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

  /*
   * ---------------------------------------------------------
   * CHECKOUT PAGE
   * ---------------------------------------------------------
   */

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

        {/* =================================================
            LEFT SIDE
            ================================================= */}

        <div className="space-y-6 lg:col-span-2">

          {/* DELIVERY INFORMATION */}

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

                  <Label>
                    First Name
                  </Label>

                  <Input
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <Label>
                    Last Name
                  </Label>

                  <Input
                    value={lastName}
                    onChange={(e) =>
                      setLastName(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div>

                <Label>
                  Address
                </Label>

                <Input
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <div>

                  <Label>
                    City
                  </Label>

                  <Input
                    value={city}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <Label>
                    State
                  </Label>

                  <Input
                    value={state}
                    onChange={(e) =>
                      setState(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <Label>
                    Phone
                  </Label>

                  <Input
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </CardContent>

          </Card>

          {/* PAYMENT METHOD */}

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
                onValueChange={
                  setPaymentMethod
                }
              >

                <div className="flex items-center gap-3 rounded-lg border p-4">

                  <RadioGroupItem
                    value="paystack"
                    id="paystack"
                  />

                  <Label htmlFor="paystack">
                    Paystack
                  </Label>

                </div>

                <div className="mt-3 flex items-center gap-3 rounded-lg border p-4">

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

        {/* =================================================
            RIGHT SIDE
            ================================================= */}

        <div>

          <Card>

            <CardHeader>

              <CardTitle className="flex items-center gap-2">

                <ShoppingBag className="h-5 w-5 text-primary" />

                Order Summary

              </CardTitle>

            </CardHeader>

            <CardContent>

              {cart.map(
                (item) => (
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
                          Qty:{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <strong>

                        ₦
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}

                      </strong>

                    </div>

                    <div className="mt-3">

                      <Label>
                        Delivery Option
                      </Label>

                      <select
                        className="mt-1 w-full rounded-md border p-2"
                        value={
                          selectedDelivery[
                            item.id
                          ]?.id || ""
                        }
                        onChange={(e) => {

                          const option =
                            deliveryOptions[
                              item.id
                            ]?.find(
                              (o) =>
                                o.id ===
                                e.target.value
                            );

                          if (!option)
                            return;

                          setSelectedDelivery(
                            (prev) => ({
                              ...prev,

                              [item.id]:
                                option,
                            })
                          );

                        }}
                      >

                        <option value="">
                          Select Delivery
                        </option>

                        {(
                          deliveryOptions[
                            item.id
                          ] || []
                        ).map(
                          (option) => (
                            <option
                              key={
                                option.id
                              }
                              value={
                                option.id
                              }
                            >

                              {
                                option.option_name
                              }{" "}

                              -

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
                )
              )}

              <Separator className="my-4" />

              <div className="space-y-2">

                <div className="flex justify-between">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₦
                    {cartTotal.toLocaleString()}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span>
                    Shipping
                  </span>

                  <span>
                    ₦
                    {shippingCost.toLocaleString()}
                  </span>

                </div>

                <div className="flex justify-between text-lg font-bold">

                  <span>
                    Total
                  </span>

                  <span>
                    ₦
                    {totalAmount.toLocaleString()}
                  </span>

                </div>

              </div>

            </CardContent>

            <CardFooter className="flex-col gap-3">

              <Button
                onClick={
                  handleCheckout
                }
                disabled={
                  isProcessing
                }
                className="w-full"
              >

                {isProcessing
                  ? "Processing..."
                  : `Pay ₦${totalAmount.toLocaleString()}`}

              </Button>

              {paymentStatusUnknown && (

                <p className="text-center text-xs text-amber-600">

                  Your payment status
                  could not be confirmed
                  yet. Your order has
                  been saved for recovery.

                </p>

              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">

                <ShieldCheck className="h-4 w-4" />

                Secure Checkout

              </div>

            </CardFooter>

          </Card>

          {/* ESCROW INFORMATION */}

          <div className="mt-6 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">

            <p className="mb-2 flex items-center gap-2 font-bold text-foreground">

              <Package className="h-4 w-4" />

              FarmLink Escrow Protection

            </p>

            Your payment is securely held
            until your order is delivered
            successfully.

          </div>

        </div>

      </div>

    </div>
  );
}
