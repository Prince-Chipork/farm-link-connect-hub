import { Card, CardContent } from "@/components/ui/card";
import { 
  Leaf, 
  Beef, 
  Apple, 
  Milk, 
  Wheat, 
  Flower2, 
  ArrowRight,
  Fish
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { 
    name: "Crops", 
    description: "Cassava, Yam, Grains",
    icon: Wheat, 
    color: "text-amber-600", 
    bg: "bg-amber-100/50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50"
  },
  { 
    name: "Livestock", 
    description: "Cattle, Goats, Sheep",
    icon: Beef, 
    color: "text-rose-600", 
    bg: "bg-rose-100/50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900/50"
  },
  { 
    name: "Poultry", 
    description: "Chicken, Eggs, Turkey",
    icon: Apple, 
    color: "text-red-600", 
    bg: "bg-red-100/50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900/50"
  },
  { 
    name: "Fishery", 
    description: "Catfish, Tilapia, Seafood",
    icon: Fish, 
    color: "text-blue-600", 
    bg: "bg-blue-100/50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900/50"
  },
  { 
    name: "Vegetables", 
    description: "Fresh Greens, Tomatoes",
    icon: Leaf, 
    color: "text-green-600", 
    bg: "bg-green-100/50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900/50"
  },
  { 
    name: "Processed", 
    description: "Palm Oil, Garri, Cocoa",
    icon: Flower2, 
    color: "text-purple-600", 
    bg: "bg-purple-100/50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-900/50"
  },
];

export default function Categories() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg italic">
            "Everything from the Nigerian soil, direct to you."
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${category.name}`}>
              <Card className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 ${category.border} overflow-hidden`}>
                <CardContent className="p-8 flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${category.bg} ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="h-10 w-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
