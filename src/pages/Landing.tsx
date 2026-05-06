import TopNav from "@/components/landing/TopNav";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <Hero />
      <ProblemSection />
    </div>
  );
}