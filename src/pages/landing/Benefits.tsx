import { ShieldCheck, TrendingUp, Truck, Users, Award, Wallet } from "lucide-react";

const benefits = [
  { 
    title: "Verified Farmers", 
    description: "Every farmer on our platform goes through a multi-stage verification process including farm visits and document checks.", 
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-950/30"
  },
  { 
    title: "No Middlemen", 
    description: "Buy directly from the source. This means better prices for buyers and higher profits for hardworking Nigerian farmers.", 
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-950/30"
  },
  { 
    title: "Trust Escrow", 
    description: "Your money is safe. We hold payments in escrow and only release them to the farmer when you confirm receipt and quality.", 
    icon: Award,
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-950/30"
  },
  { 
    title: "Seamless Logistics", 
    description: "Integrated logistics partners ensure your products are handled with care and delivered fresh to your doorstep across Nigeria.", 
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-950/30"
  },
  { 
    title: "Secure Payments", 
    description: "Pay with ease using Card, Bank Transfer, USSD or your FarmLink Wallet. All transactions are encrypted and secure.", 
    icon: Wallet,
    color: "text-rose-600",
    bg: "bg-rose-100 dark:bg-rose-950/30"
  },
  { 
    title: "Community Growth", 
    description: "By using FarmLink, you're directly contributing to the growth of the Nigerian agricultural sector and local economies.", 
    icon: Users,
    color: "text-cyan-600",
    bg: "bg-cyan-100 dark:bg-cyan-950/30"
  },
];

export default function Benefits() {
  return (
    <section className="py-24 bg-background border-y">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">The FarmLink Advantage</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Why Stakeholders Trust Us</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="p-8 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
