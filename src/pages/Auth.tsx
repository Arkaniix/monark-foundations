import BackgroundTicker from "@/components/auth/BackgroundTicker";
import AuthCard from "@/components/auth/AuthCard";

export default function Auth() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundTicker />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at center, rgba(59,130,246,0.10), rgba(59,130,246,0.04) 40%, transparent 70%)",
        }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <AuthCard />
      </div>
    </div>
  );
}
