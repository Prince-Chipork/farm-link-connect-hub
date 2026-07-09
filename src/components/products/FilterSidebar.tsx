import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type FilterSidebarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoryChange: (category: string, checked: boolean) => void;
  priceRange: number[];
  onPriceChange: (value: number[]) => void;
  onClearFilters: () => void;
};

const categories = ["Crops", "Livestock", "Poultry", "Fishery", "Processed"];

const FilterSidebar = ({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
  onClearFilters,
}: FilterSidebarProps) => {
  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || priceRange[0] < 100000;

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 text-xs">
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="search" className="font-semibold text-sm">Search</Label>
          <Input
            id="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category.toLowerCase()}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => onCategoryChange(category, checked as boolean)}
                />
                <Label htmlFor={category.toLowerCase()} className="text-sm font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Max Price (\u20a6)</h4>
          <Slider
            value={priceRange}
            onValueChange={onPriceChange}
            max={100000}
            min={0}
            step={1000}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>$0</span>
            <span className="font-medium text-foreground">\u20a6{priceRange[0].toLocaleString()}</span>
            <span>$100k+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
