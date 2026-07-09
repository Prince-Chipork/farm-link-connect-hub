import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ShoppingCart,
  Heart,
  Package,
  ArrowRight,
  Star,
  Award,
  MapPin,
  Leaf,
  Wheat,
  Beef,
  Apple,
  Milk,
  Flower2,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";

const revenueData = [
  { name: "Jan", revenue: 450000 },
  { name: "Feb", revenue: 380000 },
  { name: "Mar", revenue: 620000 },
  { name: "Apr", revenue: 540000 },
  { name: "May", revenue: 780000 },
  { name: "Jun", revenue: 690000 },
];

const categories = [
  { name: "Vegetables", icon: Leaf, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
  { name: "Crops", icon: Wheat, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { name: "Livestock", icon: Beef, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
  { name: "Poultry", icon: Apple, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  { name: "Fishery", icon: Milk, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { name: "Processed", icon: Flower2, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
];

const trustLevelColors: Record<string, string> = {
  Platinum: "bg-blue-600",
  Gold: "bg-yellow-600",
  Silver: "bg-slate-400",
  Bronze: "bg-orange-700",
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { cartCount, addToCart } = useCart();
  const [ordersCount, setOrdersCount] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('*, order_items(*)').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(3),
          supabase.from('products').select('*, profiles(full_name, is_verified, trust_level)').eq('is_available', true).limit(4)
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (productsRes.error) throw productsRes.error;

        setRecentOrders(ordersRes.data || []);
        
        // Fetch total count and spent
        const { data: allOrders, error: countError } = await supabase.from('orders').select('total').eq('buyer_id', user.id);
        if (countError) throw countError;
        
        setOrdersCount(allOrders?.length || 0);
        setTotalSpent(allOrders?.reduce((acc, curr) => acc + Number(curr.total || 0), 0) || 0);
        
        const mapped: Product[] = productsRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description || "",
          quantity: p.quantity,
          unit: p.unit as any,
          price: p.price,
          harvestDate: p.harvest_date || "",
          location: p.location || "",
          images: p.images || [],
          deliveryOptions: p.delivery_options || [],
          farmerId: p.farmer_id,
          farmerName: p.profiles?.full_name || "Unknown Farmer",
          farmerVerified: p.profiles?.is_verified || false,
          farmerTrustLevel: p.profiles?.trust_level || "Bronze",
        }));
        setRecommendedProducts(mapped);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">Discover fresh products from local farmers.</p>
        </div>
        <Link to="/products">
          <Button className="w-full md:w-auto">Start Shopping</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{ordersCount}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{cartCount}</p>
              <p className="text-xs text-muted-foreground">Items in Cart</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Wishlist Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Shop by Category</h2>
          <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.name.toLowerCase()}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className={`p-3 rounded-full ${cat.bg}`}>
                    <cat.icon className={`h-6 w-6 ${cat.color}`} />
                  </div>
                  <span className="text-xs font-medium">{cat.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            See More <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-muted relative">
                <img
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.farmerVerified && (
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white text-[10px]">
                    ✓ Verified
                  </Badge>
                )}
                <Badge className={`absolute top-2 right-2 ${trustLevelColors[product.farmerTrustLevel]} text-white gap-1 text-[10px]`}>
                  <Award className="h-2.5 w-2.5" /> {product.farmerTrustLevel}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">4.8</span>
                </div>
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-xs font-medium">{product.farmerName}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {product.location}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-primary text-sm">₦{product.price.toLocaleString()}/{product.unit}</span>
                  <Button
                    size="sm"
                    className="h-8 text-xs px-2"
                    onClick={() => {
                      addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0] });
                      toast.success("Added to cart");
                    }}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link to="/buyer/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3">
          {recentOrders.length > 0 ? recentOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Order #{order.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} • {order.order_items?.length || 0} item(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="capitalize text-[10px]" variant="outline">
                    {order.status}
                  </Badge>
                  <span className="font-semibold text-sm">₦{Number(order.total || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="p-8 text-center text-muted-foreground italic text-sm">
              No recent orders found.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
