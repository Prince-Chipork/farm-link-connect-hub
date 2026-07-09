import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types";
import { toast } from "sonner";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(full_name, is_verified, trust_level)')
        .eq('is_available', true)
        .limit(4);

      if (error) {
        toast.error(error.message);
      } else {
        const mapped: Product[] = data.map((p: any) => ({
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
        setProducts(mapped);
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Fresh & Quality</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Today's Featured Harvest</h3>
            <p className="mt-4 text-muted-foreground text-lg">
                Discover premium agricultural products sourced directly from our Platinum and Gold tier verified farmers.
            </p>
          </div>
          <Button variant="ghost" className="text-primary hover:text-primary/80 font-bold gap-2 text-lg h-auto p-0" asChild>
            <Link to="/products">Explore Marketplace <ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading 
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)
          }
        </div>
      </div>
    </section>
  )
}
