import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function BuyerWishlist() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      // Placeholder: fetch some products since we don't have a wishlist table yet
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(full_name, is_verified, trust_level)')
        .limit(4);

      if (error) {
        toast.error(error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
    toast.success("Removed from wishlist");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/products">Explore Products</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="p-16 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mb-6">
            Save products you're interested in and they'll appear here for easy access later.
          </p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group border shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white text-red-500 shadow-sm"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {(product.stock_quantity || 0) <= 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">4.5</span>
                  <span className="text-[10px] text-muted-foreground">(24)</span>
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{product.profiles?.full_name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">
                    ₦{Number(product.price || 0).toLocaleString()}
                    <span className="text-[10px] text-muted-foreground font-normal ml-0.5">/{product.unit || 'kg'}</span>
                  </span>
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    disabled={(product.stock_quantity || 0) <= 0}
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image: product.image_url
                      });
                      toast.success("Added to cart");
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
