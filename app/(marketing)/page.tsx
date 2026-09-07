import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PricingSection } from "@/components/marketing/PricingTable";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

export default function MarketingHomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <Faq />
      <FinalCta />
    </main>
  );
}
