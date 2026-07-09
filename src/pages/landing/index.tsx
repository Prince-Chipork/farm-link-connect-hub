import Benefits from "./Benefits";
import Categories from "./Categories";
import FeaturedProducts from "./FeaturedProducts";
import Hero from "./Hero";
import Testimonials from "./Testimonials";

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <Benefits />
      <Testimonials />
    </div>
  );
}
