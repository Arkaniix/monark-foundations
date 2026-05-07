import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import Field from "./Field";
import { useAuth } from "@/context/AuthContext";

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

type Phase = "idle" | "sending" | "sent" | "error";

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const auth = useAuth();
  const [email, setEmail] = useState<string>("");
  const [errEmail, setErrEmail] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setErrEmail(null);
      setPhase("idle");
      setErrMsg("");
    }
  }, [open]);

  if (!open) return null;

  const validateEmail = (v: string) => {
    if (!v) { setErrEmail("Email requis"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErrEmail("Format email invalide"); return false; }
    setErrEmail(null);
    return true;
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setPhase("sending");
    try {
      await auth.forgotPassword(email);
      setPhase("sent");
    } catch {
      setPhase("error");
      setErrMsg("Impossible d'envoyer le lien. Réessayez plus tard.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="mk-auth-card fade-up max-w-[400px] w-full mx-4 p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {phase !== "sent" ? (
          <form onSubmit={onSend}>
            <h2 className="text-[20px] font-medium tracking-tight text-zinc-50">Mot de passe oublié ?</h2>
            <p className="text-[13px] text-zinc-400 mt-1 mb-6">
              Entrez votre email, on vous envoie un lien de réinitialisation.
            </p>
            <Field
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              onBlur={() => validateEmail(email)}
              error={errEmail}
              placeholder="vous@exemple.com"
            />
            {phase === "error" && (
              <div className="mt-3 text-[12px] text-red-400">{errMsg}</div>
            )}
            <button
              type="submit"
              disabled={phase === "sending"}
              className="btn-shimmer w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-[14px] font-medium mt-5 transition-all"
            >
              {phase === "sending" ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <div className="flex justify-center mb-4">
              <Mail className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-[20px] font-medium tracking-tight text-zinc-50">Vérifiez votre boîte mail</h2>
            <p className="text-[13px] text-zinc-400 mt-2">
              Si un compte Monark est lié à cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-lg border border-white/[0.12] hover:border-white/25 text-zinc-200 text-[14px] mt-6 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}