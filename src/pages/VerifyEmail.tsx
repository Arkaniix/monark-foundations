import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import BackgroundTicker from "@/components/auth/BackgroundTicker";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Phase = "verifying" | "done" | "error";

function Shell({ children }: { children: React.ReactNode }) {
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
        <div className="mk-auth-card fade-up max-w-[400px] w-full p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const { refreshUser } = useAuth();
  const [phase, setPhase] = useState<Phase>("verifying");

  useEffect(() => {
    if (!token) {
      setPhase("error");
      return;
    }
    (async () => {
      try {
        await authApi.verifyEmail(token);
        setPhase("done");
        void refreshUser();
      } catch {
        setPhase("error");
      }
    })();
  }, [token, refreshUser]);

  if (phase === "verifying") {
    return (
      <Shell>
        <div className="text-center py-2">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-[20px] font-medium tracking-tight text-zinc-50">
            Vérification de ton adresse e-mail…
          </h2>
        </div>
      </Shell>
    );
  }

  if (phase === "done") {
    return (
      <Shell>
        <div className="text-center py-2">
          <div className="flex justify-center mb-4">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-[20px] font-medium tracking-tight text-zinc-50">
            Ton adresse e-mail est confirmée.
          </h2>
          <Link
            to="/dashboard"
            className="btn-shimmer inline-flex items-center justify-center w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-medium mt-6 transition-all"
          >
            Accéder à mon espace
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="text-center py-2">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-[20px] font-medium tracking-tight text-zinc-50">
          Lien invalide
        </h2>
        <p className="text-[13px] text-zinc-400 mt-2">
          Ce lien est invalide ou a expiré. Connecte-toi pour en demander un nouveau.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-white/[0.12] hover:border-white/25 text-zinc-200 text-[14px] mt-6 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </Shell>
  );
}