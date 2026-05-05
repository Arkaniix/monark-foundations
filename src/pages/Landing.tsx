import TopNav from "@/components/landing/TopNav";
import Hero from "@/components/landing/Hero";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <Hero />
      <div className="min-h-[100vh] flex items-center justify-center font-mono text-zinc-500 text-sm">
        Sections suivantes — à venir
      </div>
    </div>
  );
}