import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Alhaji Musa Danjuma",
    role: "Platinum Farmer, Kano",
    avatar: "https://i.pravatar.cc/150?u=musa",
    text: "FarmLink has opened up markets I never thought possible. I now sell my maize directly to companies in Lagos and Port Harcourt without any middlemen eating my profits.",
    rating: 5
  },
  {
    name: "Aisha Bello",
    role: "Founder, Aisha's Kitchens",
    avatar: "https://i.pravatar.cc/150?u=aisha",
    text: "The quality of produce I get from FarmLink is exceptional. My restaurants now serve the freshest meals, and my customers can taste the difference of farm-fresh ingredients.",
    rating: 5
  },
  {
    name: "Dr. Ben Akpan",
    role: "Aquaculture Specialist, Uyo",
    avatar: "https://i.pravatar.cc/150?u=ben",
    text: "The trust level system is a game changer. It encourages farmers like me to maintain high standards, and it gives buyers the confidence to make large purchases safely.",
    rating: 5
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Success Stories</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Trusted by Nigeria's Agric Community</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.name} className="relative overflow-hidden border-none shadow-lg">
              <CardContent className="p-8 pt-12">
                <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/10 -z-0" />
                <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                </div>
                <p className="text-muted-foreground mb-8 relative z-10 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4 border-t pt-6">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {t.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-20 p-12 rounded-3xl bg-primary text-primary-foreground text-center space-y-8 shadow-2xl shadow-primary/30">
            <h4 className="text-3xl md:text-5xl font-extrabold max-w-3xl mx-auto">Ready to grow your agricultural business?</h4>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join thousands of farmers and buyers already thriving on FarmLink.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">Join as a Buyer</Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold border-white text-white hover:bg-white hover:text-primary transition-all">Become a Seller</Button>
            </div>
        </div>
      </div>
    </section>
  );
}
