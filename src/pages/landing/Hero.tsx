import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/8d322e49-9a02-4b5b-82a4-475380de7bac/farmlink-hero-image-f19294af-1783335192780.webp" 
          alt="Nigerian Farmers" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-left text-white space-y-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" /> Trusted by 5,000+ Nigerian Farmers
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Direct from <span className="text-primary">Farm</span> to your <span className="text-primary">Table</span>.
          </h1>
          
          <p className="text-xl text-gray-200 leading-relaxed max-w-xl">
            FarmLink is Nigeria's most trusted digital marketplace for fresh, high-quality agricultural products direct from verified local farmers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20" asChild>
              <Link to="/products">Start Shopping <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold backdrop-blur-md bg-white/5 border-white/20 hover:bg-white/10 text-white" asChild>
              <Link to="/signup">Register as Farmer</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">₦500M+</span>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Sales</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">12k+</span>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Happy Buyers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">36</span>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">States Covered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
