import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function FarmerProducts() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        const fetchMyProducts = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("farmer_id", user.id)
    .eq("is_available", !showArchived);

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
                    farmerId: user.id,
                    farmerName: user.name,
                    farmerVerified: user.verified || false,
                    farmerTrustLevel: user.trustLevel || "Bronze",
                }));
                setProducts(mapped);
            }
            setLoading(false);
        };

        fetchMyProducts();
    }, [user, showArchived]);

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
const deleteProduct = async (productId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

  try {
    const { error } = await (supabase as any).rpc(
      "delete_farmer_product",
      {
        p_product_id: productId,
      }
    );

    if (error) throw error;

    setProducts((current) =>
      current.filter((p) => p.id !== productId)
    );

    if (data?.action === "archived") {
  toast.success("Product archived successfully.");
} else {
  toast.success("Product deleted successfully.");
}
  } catch (error: any) {
    console.error(error);
    toast.error(error.message ?? "Failed to delete product.");
  }
};
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">My Products</h1>

    <p className="text-muted-foreground text-sm">
      Manage your listed farm produce
    </p>

    <div className="flex gap-2 mt-3">
      <Button
        size="sm"
        variant={!showArchived ? "default" : "outline"}
        onClick={() => setShowArchived(false)}
      >
        Active
      </Button>

      <Button
        size="sm"
        variant={showArchived ? "default" : "outline"}
        onClick={() => setShowArchived(true)}
      >
        Archived
      </Button>
    </div>
  </div>

  <Button asChild>
    <Link to="/farmer/products/new">
      <Plus className="mr-2 h-4 w-4" />
      Add Product
    </Link>
  </Button>
</div>

            {products.length === 0 ? (
                <EmptyState 
                    icon={<Package className="h-16 w-16" />}
                    title="You have no products yet"
                    description="Start by adding your first product to see it here."
                    action={{
                        text: "Add Product",
                        onClick: () => {}
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
  <div key={product.id} className="space-y-3">
    <ProductCard product={product} />

    <div className="flex gap-2">
      <Button
        asChild
        variant="outline"
        className="flex-1"
      >
        <Link to={`/farmer/products/edit/${product.id}`}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>

      <Button
  variant="destructive"
  className="flex-1"
  onClick={() => deleteProduct(product.id)}
>
  <Trash2 className="mr-2 h-4 w-4" />
  Delete
</Button>
    </div>
  </div>
))}
                </div>
            )}
        </div>
    );
}
