import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Cart</h1>
          <p className="text-muted-foreground">
            {cartCount} item(s) in your cart
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

  <div className="lg:col-span-2 space-y-4">

    {cart.length === 0 ? (

      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">
            Your cart is empty
          </h2>

          <Button asChild className="mt-4">
            <Link to="/products">
              Browse Products
            </Link>
          </Button>
        </CardContent>
      </Card>

    ) : (

      cart.map((item) => (

        <Card key={item.id}>
          <CardContent className="p-4 flex items-center gap-4">

            <img
              src={item.image}
              alt={item.name}
              className="h-20 w-20 rounded-lg object-cover border"
            />

            <div className="flex-1">
              <h3 className="font-semibold">
                {item.name}
              </h3>

              <p className="text-primary font-bold">
                ₦{item.price.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">

              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  updateQuantity(item.id, item.quantity - 1)
                }
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="w-8 text-center">
                {item.quantity}
              </span>

              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  updateQuantity(item.id, item.quantity + 1)
                }
              >
                <Plus className="h-4 w-4" />
              </Button>

            </div>

            <Button
              size="icon"
              variant="destructive"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

          </CardContent>
        </Card>

      ))

    )}

  </div>
        <div className="space-y-4">

  <Card>

    <CardContent className="p-6 space-y-4">

      <h2 className="text-xl font-bold">
        Order Summary
      </h2>

      <div className="flex justify-between">
        <span>Total Items</span>
        <span>{cartCount}</span>
      </div>

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₦{cartTotal.toLocaleString()}</span>
      </div>

      <hr />

      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span className="text-primary">
          ₦{cartTotal.toLocaleString()}
        </span>
      </div>

      <Button
        asChild
        className="w-full h-12"
        disabled={cart.length === 0}
      >
        <Link to="/checkout">
          Proceed to Checkout
        </Link>
      </Button>

    </CardContent>

  </Card>

</div>

</div>
    </div>
  );
}
