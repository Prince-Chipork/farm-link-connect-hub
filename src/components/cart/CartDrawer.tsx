import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

const CartDrawer = () => {
  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const navigate = useNavigate();
  const productsTotal = cart.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Browse products and add items to your cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md object-cover" />
                )}
                <div className="flex-1 min-w-0 space-y-1">

  <p className="font-semibold text-sm">
    {item.name}
  </p>

  {item.farmer_name && (
    <p className="text-xs text-muted-foreground">
      Farmer: {item.farmer_name}
    </p>
  )}

  <p className="text-sm text-primary font-medium">
    ₦{item.price.toLocaleString()} × {item.quantity}
  </p>

  <p className="text-sm font-bold">
  Total: ₦{(item.price * item.quantity).toLocaleString()}
</p>

</div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-1 text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-3">
              <div className="space-y-2">

  <div className="flex justify-between text-sm">
    <span>Products</span>
    <span>₦{productsTotal.toLocaleString()}</span>
  </div>

  <hr />

  <div className="flex justify-between text-lg font-bold">
    <span>Product Total</span>
    <span className="text-primary">
      ₦{cartTotal.toLocaleString()}
    </span>
    <p className="text-xs text-muted-foreground text-center">
  Delivery charges will be selected during checkout.
</p>
  </div>

</div>

<Button
  variant="outline"
  className="w-full"
  onClick={() => navigate("/cart")}
>
  View Full Cart
</Button>

<Button
  className="w-full"
  size="lg"
  onClick={() => navigate("/checkout")}
>
  Proceed to Checkout
</Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
