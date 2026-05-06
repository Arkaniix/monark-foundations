import TopNav from "@/components/landing/TopNav";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import LensSection from "@/components/landing/LensSection";
import EstimatorSection from "@/components/landing/EstimatorSection";
import StockRepairSection from "@/components/landing/StockRepairSection";
import ConstellationSection from "@/components/landing/ConstellationSection";

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
    </div>
  );
}