import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Package,
  ShoppingBag,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [address, setAddress] = useState("");

  const shippingCost = cart.length > 0 ? 2500 : 0;
  const totalAmount = cartTotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !user) return;
    if (!address) {
      toast.error("Please enter a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          total: totalAmount,
          delivery_address: address,
          shipping_cost: shippingCost,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const items = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(items);
      if (itemsError) throw itemsError;

      setIsSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order has been placed and is being processed by the farmer. 
          You will receive an update shortly.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full h-12 text-lg">
            <Link to="/buyer/orders">Track My Order</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 text-lg">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shopping
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="e.g. Chidi" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="e.g. Okafor" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Delivery Address</Label>
                <Input id="address" placeholder="Plot 12, Gwarinpa Estate, Abuja" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Abuja" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="FCT" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="080 1234 5678" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="paystack" className="space-y-4">
                <div className="flex items-center space-x-4 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                    <div className="font-bold">Paystack (Card, Transfer, USSD)</div>
                    <div className="text-xs text-muted-foreground">Secure payment processed by Paystack</div>
                  </Label>
                  <img src="https://paystack.com/assets/img/login/paystack-logo.png" alt="Paystack" className="h-4 opacity-50" />
                </div>
                <div className="flex items-center space-x-4 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors opacity-50 grayscale">
                  <RadioGroupItem value="wallet" id="wallet" disabled />
                  <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                    <div className="font-bold">FarmLink Wallet</div>
                    <div className="text-xs text-muted-foreground">Insufficient balance (\u20a60.00)</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-4 border p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="font-bold">Payment on Delivery</div>
                    <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="h-12 w-12 rounded border bg-muted shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-muted-foreground">{item.quantity} x \u20a6{item.price.toLocaleString()}</p>
                      </div>
                      <span className="font-bold">\u20a6{(item.quantity * item.price).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground italic">Your cart is empty</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>\u20a6{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span>\u20a6{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">\u20a6{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button 
                className="w-full h-12 text-lg shadow-lg" 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay \u20a6${totalAmount.toLocaleString()}`}
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <ShieldCheck className="h-3 w-3" /> Secure Checkout
              </div>
            </CardFooter>
          </Card>

          <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-xs text-muted-foreground space-y-2">
             <p className="flex items-center gap-2 font-bold text-foreground">
                <Package className="h-3 w-3" /> FarmLink Trust Level Protection
             </p>
             <p>
                Your payment is held in escrow and only released to the farmer after you confirm receipt of the products in the specified condition.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
