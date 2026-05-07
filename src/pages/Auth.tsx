import Logo from "@/components/ui/Logo";
import BackgroundTicker from "@/components/auth/BackgroundTicker";

export default function Auth() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundTicker />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        <div className="mk-auth-card w-full max-w-md p-8 fade-up">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <p className="text-center font-mono text-[11px] tracking-wider text-zinc-500">
            Form auth — P3.2b
          </p>
        </div>
      </div>
    </div>
  );
}
