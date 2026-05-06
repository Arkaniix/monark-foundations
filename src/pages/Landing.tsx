import TopNav from "@/components/landing/TopNav";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import LensSection from "@/components/landing/LensSection";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <Hero />
      <ProblemSection />
      <LensSection />
    </div>
  );
}