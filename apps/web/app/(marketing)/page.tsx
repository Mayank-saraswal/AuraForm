// apps/web/app/(marketing)/page.tsx
import { HeroSection }     from "~/components/marketing/hero";
import { FeaturesSection } from "~/components/marketing/features";
import { ThemesSection }   from "~/components/marketing/themes";
import { HowItWorks }      from "~/components/marketing/how-it-works";
import { SocialProof }     from "~/components/marketing/social-proof";
import { CTASection }      from "~/components/marketing/cta";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ThemesSection />
      <HowItWorks />
      <SocialProof />
      <CTASection />
    </>
  );
}
