import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";
import { Verified, Award, MapPin } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const trustLevelColors = {
  Platinum: "bg-blue-600",
  Gold: "bg-yellow-600",
  Silver: "bg-slate-400",
  Bronze: "bg-orange-700",
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out group">
        <div className="relative">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.farmerVerified && (
            <Badge className="absolute top-2 right-2 bg-green-600 text-white gap-1">
              <Verified className="h-3 w-3" /> Verified
            </Badge>
          )}
          <Badge className={`absolute top-2 left-2 ${trustLevelColors[product.farmerTrustLevel]} text-white gap-1`}>
            <Award className="h-3 w-3" /> {product.farmerTrustLevel}
          </Badge>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <h3 className="text-lg font-bold mt-1 leading-tight">{product.name}</h3>
          <div className="flex flex-col mt-2 gap-1">
            <p className="text-sm font-medium">{product.farmerName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {product.location}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="text-xl font-semibold text-primary">
            ₦{product.price.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">/{product.unit}</span>
          </p>
          <Button asChild size="sm">
            <Link to={`/products/${product.id}`}>View</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-lg shadow-sm">
      <Skeleton className="w-full h-48" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-full mb-3" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-9 w-16" />
      </CardFooter>
    </Card>
  )
}
