import BackgroundTicker from "@/components/auth/BackgroundTicker";
import AuthCard from "@/components/auth/AuthCard";

export default function Auth() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundTicker />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <AuthCard />
      </div>
    </div>
  );
}
