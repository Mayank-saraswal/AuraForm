import { HeroSection } from "~/components/marketing/hero";
import { TestimonialSection } from "~/components/marketing/testimonial";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <HeroSection />
      <TestimonialSection />
    </div>
  );
}
