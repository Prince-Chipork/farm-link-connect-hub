import { useEffect, useMemo, useRef, useState } from "react";
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

/*
 * ---------------------------------------------------------
 * DELIVERY TYPES
 * ---------------------------------------------------------
 */

type DeliveryOption = {
  delivery_method_id: string;
  delivery_method: string;
  description: string | null;
  capacity_kg: number | null;
  delivery_fee: number;
};

/*
 * ---------------------------------------------------------
 * FARM LINK DELIVERY ZONES
 * ---------------------------------------------------------
 *
 * These are the zones currently configured in Supabase.
 *
 * Farm Zone -> Aliade
 *
 * We will make destination-zone selection dynamic later.
 */

const FARM_ZONE_ID =
  "196c3010-0faf-4eb8-9719-6b86af3818ff";

const ALIADE_ZONE_ID =
  "6e626bc7-8c1c-4323-9809-44112f5cc3ba";

/*
 * ---------------------------------------------------------
 * CHECKOUT PAGE
 * ---------------------------------------------------------
 */

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [paymentReference, setPaymentReference] =
    useState("");

  const [paymentStatusUnknown, setPaymentStatusUnknown] =
    useState(false);

  const [initializedOrderId, setInitializedOrderId] =
    useState("");

  const initializedOrderIdRef = useRef("");

  const [pendingOrderId, setPendingOrderId] =
    useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("paystack");

  /*
   * -------------------------------------------------------
   * DELIVERY STATE
   * -------------------------------------------------------
   */

  const [deliveryOptions, setDeliveryOptions] =
    useState<DeliveryOption[]>([]);

  const [selectedDeliveryMethodId, setSelectedDeliveryMethodId] =
    useState("");

  const [isLoadingDelivery, setIsLoadingDelivery] =
    useState(false);

  /*
   * -------------------------------------------------------
   * CALCULATE TOTAL ORDER WEIGHT
   * -------------------------------------------------------
   *
   * If products already contain weight_kg, use it.
   *
   * Until product weight is mandatory in the database,
   * fallback to 1kg per unit.
   */

  const totalWeightKg = useMemo(() => {
    return cart.reduce((total, item: any) => {
      const weightPerUnit =
        Number(item.weight_kg) > 0
          ? Number(item.weight_kg)
          : 1;

      return total + weightPerUnit * item.quantity;
    }, 0);
  }, [cart]);

  /*
   * -------------------------------------------------------
   * DISTANCE
   * -------------------------------------------------------
   *
   * Actual distance calculation will be introduced later.
   *
   * For now 0 means:
   * "Use the base pricing rule without a distance surcharge."
   */

  const distanceKm = 0;

  /*
   * -------------------------------------------------------
   * LOAD DELIVERY METHODS
   * -------------------------------------------------------
   */

  useEffect(() => {
    const loadDeliveryOptions = async () => {
      if (cart.length === 0) {
        setDeliveryOptions([]);
        setSelectedDeliveryMethodId("");
        return;
      }

      setIsLoadingDelivery(true);

      try {
        const { data, error } = await supabase.rpc(
          "get_delivery_options_for_checkout",
          {
            p_origin_zone_id: FARM_ZONE_ID,
            p_destination_zone_id: ALIADE_ZONE_ID,
            p_weight_kg: totalWeightKg,
            p_distance_km: distanceKm,
          }
        );

        if (error) {
          console.error(
            "Delivery options error:",
            error
          );

          toast.error(
            "Unable to load delivery options."
          );

          setDeliveryOptions([]);
          setSelectedDeliveryMethodId("");

          return;
        }

        const options =
          (data as DeliveryOption[]) || [];

        setDeliveryOptions(options);

        /*
         * Automatically select the cheapest
         * available delivery method.
         *
         * The buyer can change it afterwards.
         */

        if (options.length > 0) {
          setSelectedDeliveryMethodId(
            options[0].delivery_method_id
          );
        } else {
          setSelectedDeliveryMethodId("");
        }
      } catch (error) {
        console.error(
          "Unexpected delivery loading error:",
          error
        );

        toast.error(
          "Unable to load delivery options."
        );

        setDeliveryOptions([]);
        setSelectedDeliveryMethodId("");
      } finally {
        setIsLoadingDelivery(false);
      }
    };

    loadDeliveryOptions();
  }, [cart, totalWeightKg]);

  /*
   * -------------------------------------------------------
   * SELECTED DELIVERY
   * -------------------------------------------------------
   */

  const selectedDelivery = useMemo(() => {
    return deliveryOptions.find(
      (option) =>
        option.delivery_method_id ===
        selectedDeliveryMethodId
    );
  }, [
    deliveryOptions,
    selectedDeliveryMethodId,
  ]);

  /*
   * -------------------------------------------------------
   * SHIPPING AND TOTAL
   * -------------------------------------------------------
   */

  const shippingCost =
    Number(selectedDelivery?.delivery_fee || 0);

  const totalAmount =
    cartTotal + shippingCost;

  /*
   * -------------------------------------------------------
   * INITIALIZE ORDER
   * -------------------------------------------------------
   */

  const initializeOrder = async (
    reference: string
  ) => {
    if (!user) {
      throw new Error(
        "You must be logged in."
      );
    }

    if (!selectedDelivery) {
      throw new Error(
        "Please select a delivery method."
      );
    }

    /*
     * Create the order BEFORE Paystack opens.
     */

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
     * Create order items.
     *
     * delivery_fee is currently stored against
     * each item for compatibility with the existing
     * Farm Link order structure.
     */

    const items = cart.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.id,
      farmer_id: item.farmer_id,
      quantity: item.quantity,
      price: item.price,
      delivery_fee: shippingCost,
    }));

    const { error: itemError } =
      await (supabase as any)
        .from("order_items")
        .insert(items);

    if (itemError) {
      /*
       * Payment has not started yet,
       * so remove the incomplete order.
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
   */

  const verifyPayment = async (
    reference: any
  ) => {
    const referenceValue =
      reference.reference ||
      reference.trxref;

    if (!referenceValue) {
      toast.error(
        "Payment reference was not received."
      );
      return;
    }

    const orderId =
      initializedOrderIdRef.current;

    if (!orderId) {
      toast.error(
        "Your order could not be identified. Please do not pay again."
      );
      return;
    }

    setPaymentReference(
      referenceValue
    );

    setPaymentStatusUnknown(false);

    toast.loading(
      "Verifying payment...",
      {
        id: "verify-payment",
      }
    );

    try {
      const response = await fetch(
        "https://tqsozciafuxrxumnxkjr.supabase.co/functions/v1/verify-payment",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
            reference:
              referenceValue,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        toast.error(
          result.message ||
            "Payment verification failed.",
          {
            id: "verify-payment",
          }
        );

        return;
      }

      toast.success(
        "Payment verified successfully.",
        {
          id: "verify-payment",
        }
      );

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
   * COMPLETE EXISTING ORDER AFTER PAYMENT
   * ---------------------------------------------------------
   */

  const handlePlaceOrder = async (
    orderId: string,
    reference: string,
    paymentStatus: string,
    paidAt: string
  ) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      /*
       * Update existing order.
       */

      const { error: orderError } =
        await supabase
          .from("orders")
          .update({
            payment_reference:
              reference,
            payment_status:
              paymentStatus,
            paid_at:
              paidAt || null,
            status: "Pending",
          })
          .eq("id", orderId)
          .eq("buyer_id", user.id);

      if (orderError) {
        throw orderError;
      }

      /*
       * Notify buyer.
       */

      await createNotification({
        userId: user.id,
        title:
          "Order Placed Successfully",
        message: `Your order #${orderId.slice(
          0,
          8
        )} has been placed successfully.`,
        type: "new_order",
        link: `/buyer/orders/${orderId}/track`,
        metadata: {
          order_id: orderId,
        },
      });

      /*
       * Notify farmers.
       */

      const uniqueFarmers = [
        ...new Set(
          cart.map(
            (item) =>
              item.farmer_id
          )
        ),
      ];

      for (
        const farmerId of uniqueFarmers
      ) {
        await createNotification({
          userId: farmerId,
          title:
            "New Paid Order",
          message:
            "A buyer has successfully completed payment for a new order.",
          type: "new_order",
          link: "/farmer/orders",
          metadata: {
            order_id: orderId,
          },
        });
      }

      /*
       * Notify administrators.
       */

      const {
        data: admins,
        error: adminError,
      } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      if (adminError) {
        console.error(
          "Unable to fetch admins:",
          adminError
        );
      } else if (admins) {
        for (
          const admin of admins
        ) {
          await createNotification({
            userId: admin.id,
            title:
              "New Paid Order",
            message: `A new paid order #${orderId.slice(
              0,
              8
            )} has been received.`,
            type: "new_order",
            link: `/admin/orders/${orderId}`,
            metadata: {
              order_id: orderId,
            },
          });
        }
      }

      /*
       * Complete checkout.
       */

      clearCart();

      setIsSuccess(true);

      setPaymentStatusUnknown(false);

      toast.success(
        "Payment confirmed and order placed successfully!"
      );
    } catch (error: any) {
      console.error(
        "Order completion error:",
        error
      );

      toast.error(
        error.message ||
          "Payment was confirmed, but we could not complete the order."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * PAYSTACK CONFIGURATION
   * ---------------------------------------------------------
   */

  const paystackConfig = {
    email: user?.email ?? "",

    amount:
      Math.round(totalAmount * 100),

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

  const handleCheckout = async () => {
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

    if (!selectedDelivery) {
      toast.error(
        "Please select a delivery method."
      );
      return;
    }

    if (isLoadingDelivery) {
      toast.error(
        "Please wait for delivery options to finish loading."
      );
      return;
    }

    /*
     * Generate one Farm Link reference.
     */

    const reference =
      `FL-${crypto.randomUUID()}`;

    setPaymentReference(
      reference
    );

    setPaymentStatusUnknown(false);

    /*
     * -------------------------------------------------------
     * PAY ON DELIVERY
     * -------------------------------------------------------
     */

    if (
      paymentMethod === "cod"
    ) {
      try {
        setIsProcessing(true);

        const {
          orderId,
        } = await initializeOrder(
          reference
        );

        setPendingOrderId(
          orderId
        );

        clearCart();

        setIsSuccess(true);

        toast.success(
          "Order placed successfully!"
        );
      } catch (error: any) {
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
     * -------------------------------------------------------
     * PAYSTACK
     * -------------------------------------------------------
     */

    try {
      setIsProcessing(true);

      /*
       * Create database order
       * BEFORE Paystack opens.
       */

      const {
        orderId,
        paymentReference,
      } =
        await initializeOrder(
          reference
        );

      initializedOrderIdRef.current =
        orderId;

      setInitializedOrderId(
        orderId
      );

      setPaymentReference(
        paymentReference
      );

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
    } catch (error: any) {
      console.error(
        "Order initialization error:",
        error
      );

      setIsProcessing(false);

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

          {/* DELIVERY METHOD */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Method
              </CardTitle>
            </CardHeader>

            <CardContent>
              {isLoadingDelivery ? (
                <p className="text-sm text-muted-foreground">
                  Calculating available delivery methods...
                </p>
              ) : deliveryOptions.length === 0 ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-medium">
                    No delivery method is currently available for this order.
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Please check your order weight or contact Farm Link support.
                  </p>
                </div>
              ) : (
                <RadioGroup
                  value={
                    selectedDeliveryMethodId
                  }
                  onValueChange={
                    setSelectedDeliveryMethodId
                  }
                  className="space-y-3"
                >
                  {deliveryOptions.map(
                    (option) => (
                      <div
                        key={
                          option.delivery_method_id
                        }
                        className="flex items-start gap-3 rounded-lg border p-4"
                      >
                        <RadioGroupItem
                          value={
                            option.delivery_method_id
                          }
                          id={
                            option.delivery_method_id
                          }
                        />

                        <Label
                          htmlFor={
                            option.delivery_method_id
                          }
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-medium">
                                {option.delivery_method}
                              </p>

                              {option.description && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {option.description}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-muted-foreground">
                                Capacity:{" "}
                                {option.capacity_kg
                                  ? `${option.capacity_kg} kg`
                                  : "No limit"}
                              </p>
                            </div>

                            <strong className="whitespace-nowrap">
                              ₦
                              {Number(
                                option.delivery_fee
                              ).toLocaleString()}
                            </strong>
                          </div>
                        </Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Estimated order weight:{" "}
                <strong>
                  {totalWeightKg.toLocaleString()} kg
                </strong>
              </p>
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
                (item: any) => (
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
                    Delivery
                  </span>

                  <span>
                    ₦
                    {shippingCost.toLocaleString()}
                  </span>
                </div>

                {selectedDelivery && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Method
                    </span>

                    <span>
                      {selectedDelivery.delivery_method}
                    </span>
                  </div>
                )}

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
                  isProcessing ||
                  isLoadingDelivery ||
                  !selectedDelivery
                }
                className="w-full"
              >
                {isProcessing
                  ? "Processing..."
                  : paymentMethod ===
                    "cod"
                  ? `Place Order — ₦${totalAmount.toLocaleString()}`
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
