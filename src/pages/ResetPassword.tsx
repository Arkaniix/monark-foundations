import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import BackgroundTicker from "@/components/auth/BackgroundTicker";
import Field from "@/components/auth/Field";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { authApi } from "@/lib/api";



type Phase = "idle" | "submitting" | "done" | "error";

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

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  if (!token) {
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
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-white/[0.12] hover:border-white/25 text-zinc-200 text-[14px] mt-6 transition-colors"
          >
            Demander un nouveau lien
          </Link>
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
            Mot de passe réinitialisé
          </h2>
          <p className="text-[13px] text-zinc-400 mt-2">
            Tu peux maintenant te connecter avec ton nouveau mot de passe.
          </p>
          <Link
            to="/auth"
            className="btn-shimmer inline-flex items-center justify-center w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-medium mt-6 transition-all"
          >
            Se connecter
          </Link>
        </div>
      </Shell>
    );
  }

  const pwdError = pwd.length > 0 && pwd.length < 8 ? "Minimum 8 caractères" : null;
  const confirmError =
    confirm.length > 0 && confirm !== pwd ? "Les mots de passe ne correspondent pas" : null;
  const disabled = phase === "submitting" || pwd.length < 8 || pwd !== confirm;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8 || pwd !== confirm) return;
    setPhase("submitting");
    try {
      await authApi.resetPassword(token, pwd);
      setPhase("done");
    } catch {
      setPhase("error");
      setErrMsg("Ce lien de réinitialisation est invalide ou a expiré. Demande-en un nouveau.");
    }
  };

  return (
    <Shell>
      <form onSubmit={onSubmit}>
        <h2 className="text-[20px] font-medium tracking-tight text-zinc-50">
          Nouveau mot de passe
        </h2>
        <p className="text-[13px] text-zinc-400 mt-1 mb-6">
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        <div className="space-y-4">
          <div>
            <Field
              label="Nouveau mot de passe"
              type={showPwd ? "text" : "password"}
              name="new-password"
              autoComplete="new-password"
              value={pwd}
              onChange={setPwd}
              error={pwdError}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPwd ? "Masquer" : "Afficher"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <PasswordStrength pwd={pwd} />
          </div>

          <Field
            label="Confirme le mot de passe"
            type={showPwd ? "text" : "password"}
            name="confirm-password"
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
            error={confirmError}
          />
        </div>

        {phase === "error" && (
          <div className="mt-4 flex items-start gap-1.5 text-[12px] text-red-400">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              {errMsg}{" "}
              <Link to="/auth" className="underline hover:text-red-300">
                Demander un nouveau lien
              </Link>
              .
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="btn-shimmer w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-[14px] font-medium mt-5 transition-all inline-flex items-center justify-center gap-2"
        >
          {phase === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Réinitialisation…
            </>
          ) : (
            "Réinitialiser"
          )}
        </button>
      </form>
    </Shell>
  );
}