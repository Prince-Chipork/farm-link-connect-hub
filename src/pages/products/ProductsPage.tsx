import { useState, useEffect, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import FilterSidebar from "@/components/products/FilterSidebar";
import { Search, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([100000]); 
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(full_name, is_verified, trust_level)')
        .eq('is_available', true);

      if (error) {
        toast.error(error.message);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([100000]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = Number(product.price) <= priceRange[0];
      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === "price-low") return Number(a.price) - Number(b.price);
      if (sortBy === "price-high") return Number(b.price) - Number(a.price);
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <FilterSidebar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground text-sm">
                {loading ? 'Searching...' : `${filteredProducts.length} products found`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md p-1 bg-muted/50">
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={{
                  ...product,
                  farmerName: product.profiles?.full_name,
                  farmerVerified: product.profiles?.is_verified,
                  farmerTrustLevel: product.profiles?.trust_level
                }} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No products found</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                We couldn't find any products matching your current filters.
              </p>
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
