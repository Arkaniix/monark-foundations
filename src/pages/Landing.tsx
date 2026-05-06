import TopNav from "@/components/landing/TopNav";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import LensSection from "@/components/landing/LensSection";
import EstimatorSection from "@/components/landing/EstimatorSection";
import StockRepairSection from "@/components/landing/StockRepairSection";
import ConstellationSection from "@/components/landing/ConstellationSection";
import PricingSection from "@/components/landing/PricingSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";
import FooterSection from "@/components/landing/FooterSection";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <Hero />
      <ProblemSection />
      <LensSection />
      <EstimatorSection />
      <StockRepairSection />
      <ConstellationSection />
      <PricingSection />
      <FinalCtaSection />
      <FooterSection />
    </div>
  );
}