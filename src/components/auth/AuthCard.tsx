import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Check, Eye, EyeOff, ArrowRight, Mail, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiException } from "@/lib/api/client";
import Logo from "@/components/ui/Logo";
import Field from "./Field";
import PasswordStrength from "./PasswordStrength";
import SubmitSequence from "./SubmitSequence";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { readStartScreenPath } from "@/lib/useUiSettings";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 .5C5.73.5.66 5.57.66 11.85c0 5.02 3.25 9.27 7.76 10.77.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.52-.29-5.18-1.26-5.18-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16.91-.25 1.89-.38 2.86-.39.97.01 1.95.14 2.86.39 2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.2 5.59.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.15 0 .3.21.66.79.55 4.51-1.5 7.75-5.75 7.75-10.77C23.34 5.57 18.27.5 12 .5z" />
  </svg>
);

type AuthMode = "login" | "signup";
type AuthPhase = "idle" | "submitting" | "exiting" | "done";

type PlanId = "free" | "standard" | "pro";
const PLAN_META: Record<PlanId, { name: string; amount: string; price: string; credits: string; highlight: string; features: string[] }> = {
  free:     { name: "Free",     amount: "0",     price: "0 €",     credits: "10 cr/mois",  highlight: "Pour découvrir",
              features: ["Lens basique", "Estimator basic (1 cr)", "Verdict reseller", "Stock manager (5 lignes)"] },
  standard: { name: "Standard", amount: "11,99", price: "11,99 €", credits: "180 cr/mois", highlight: "Pour revendre sérieusement",
              features: ["Lens complet · 4 plateformes", "Estimator complete (3 cr)", "Stock manager illimité", "Modifiers + confiance bayésienne"] },
  pro:      { name: "Pro",      amount: "24,99", price: "24,99 €", credits: "600 cr/mois", highlight: "Pour les pros",
              features: ["Tout Standard", "Estimator pro tier (5 cr)", "Repair Guide deep diagnostic", "Historique price_observations 24 mois"] },
};

function PlanPicker({ value, onChange }: { value: PlanId; onChange: (p: PlanId) => void }) {
  const tiers: { id: PlanId; reco: boolean }[] = [
    { id: "free", reco: false }, { id: "standard", reco: true }, { id: "pro", reco: false },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiers.map((t) => {
        const m = PLAN_META[t.id];
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={"plan-card " + (selected ? "selected" : "")}
            aria-pressed={selected}
          >
            {t.reco && <span className="plan-reco">RECO</span>}
            <span className="plan-radio" />
            <div className="text-[12.5px] font-medium text-zinc-100">{m.name}</div>
            <div className="mt-1 flex items-baseline gap-0.5">
              <span className="text-[15px] font-semibold text-zinc-50 tabular-nums">{m.amount}</span>
              <span className="text-[11px] text-zinc-400">€</span>
              <span className="text-[10px] text-zinc-500 ml-0.5">/ mois</span>
            </div>
            <div className="mt-0.5 text-[10.5px] text-zinc-500">{m.credits}</div>
          </button>
        );
      })}
    </div>
  );
}

function PlanDetailsModal({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: PlanId; onChange: (p: PlanId) => void }) {
  if (!open) return null;
  const order: PlanId[] = ["free", "standard", "pro"];
  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-card relative w-full max-w-[920px] my-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-zinc-500 mb-1">DÉTAIL DES PLANS</div>
            <h2 className="text-[20px] font-medium text-zinc-50">Trois plans. Pas de palier caché.</h2>
            <p className="mt-1 text-[12.5px] text-zinc-500">Crédit = unité de calcul. Reset mensuel. Pas d'engagement.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] flex items-center justify-center transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {order.map((id) => {
            const m = PLAN_META[id];
            const selected = value === id;
            const reco = id === "standard";
            return (
              <button
                key={id}
                type="button"
                onClick={() => { onChange(id); onClose(); }}
                className={"modal-col " + (selected ? "selected" : "")}
              >
                {reco && <div className="font-mono text-[9px] tracking-wider text-blue-400 mb-1">RECOMMANDÉ</div>}
                <div className="text-[15px] font-medium text-zinc-50">{m.name}</div>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-[22px] font-semibold text-zinc-50 tabular-nums">{m.amount}</span>
                  <span className="text-[13px] text-zinc-400">€</span>
                  <span className="text-[11px] text-zinc-500 ml-1">/ mois</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-zinc-400">{m.credits}</div>
                <div className="mt-1 text-[11.5px] text-zinc-500">{m.highlight}</div>
                <div className="my-3 h-px bg-white/[0.06]" />
                <ul className="space-y-1.5">
                  {m.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-[12px] text-zinc-300">
                      <Check className="w-3 h-3 text-emerald-400/70 mt-[3px] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <div className={"h-9 rounded-md flex items-center justify-center text-[12px] font-medium transition-colors " + (selected ? "bg-blue-500/15 text-blue-300 border border-blue-500/40" : "bg-white/[0.03] text-zinc-300 border border-white/[0.06]")}>
                    {selected ? "Plan sélectionné" : "Choisir ce plan"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-center text-[11.5px] text-zinc-500">
          1 estimation Pro coûte ~ 0,04 €. Une seule annonce mal cotée vous coûte plus que ça.
        </p>
      </div>
    </div>
  );
}

export default function AuthCard({ initialPlan }: { initialPlan?: PlanId } = {}) {
  const auth = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>(initialPlan ? "signup" : "login");
  const [contentKey, setContentKey] = useState<number>(0);

  const [email, setEmail] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [pwd2, setPwd2] = useState<string>("");
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean>(false);

  const [errEmail, setErrEmail] = useState<string | null>(null);
  const [errPwd, setErrPwd] = useState<string | null>(null);
  const [errPwd2, setErrPwd2] = useState<string | null>(null);
  const [errAccept, setErrAccept] = useState<string | null>(null);

  const [phase, setPhase] = useState<AuthPhase>("idle");
  const [errorAt, setErrorAt] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "error"; msg: string } | null>(null);
  const [forceFail, setForceFail] = useState<boolean>(false);
  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [plan, setPlan] = useState<PlanId>(initialPlan ?? "standard");
  const [showPlanDetails, setShowPlanDetails] = useState<boolean>(false);

  const switchMode = (m: AuthMode) => {
    if (m === mode) return;
    setMode(m);
    setContentKey((k) => k + 1);
    setErrEmail(null);
    setErrPwd(null);
    setErrPwd2(null);
    setErrAccept(null);
  };

  const validateEmail = (v: string) => {
    if (!v) { setErrEmail("Email requis"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErrEmail("Format email invalide"); return false; }
    setErrEmail(null);
    return true;
  };
  const validatePwd = (v: string) => {
    if (!v) { setErrPwd("Mot de passe requis"); return false; }
    if (mode === "signup" && v.length < 8) { setErrPwd("Minimum 8 caractères"); return false; }
    setErrPwd(null);
    return true;
  };
  const validatePwd2 = (v: string) => {
    if (mode !== "signup") return true;
    if (v !== pwd) { setErrPwd2("Les mots de passe ne correspondent pas"); return false; }
    setErrPwd2(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const okE = validateEmail(email);
    const okP = validatePwd(pwd);
    const okP2 = validatePwd2(pwd2);
    let okA = true;
    if (mode === "signup" && !accepted) { setErrAccept("Vous devez accepter les CGU"); okA = false; }
    else setErrAccept(null);
    if (!okE || !okP || !okP2 || !okA) return;

    setApiLoading(true);
    let errored = false;
    if (forceFail) {
      errored = true;
      await new Promise((r) => setTimeout(r, 400));
    } else {
      try {
        if (mode === "login") {
          await auth.login(email, pwd);
        } else {
          await auth.register({ email, password: pwd, signup_plan: plan });
        }
      } catch (err) {
        errored = true;
        void (err as ApiException);
      }
    }
    setApiLoading(false);

    setErrorAt(errored ? 0 : null);
    setToast(null);
    setPhase("submitting");
  };

  const onSequenceSettled = () => {
    setPhase("exiting");
    setTimeout(() => {
      setPhase("done");
      const target = readStartScreenPath();
      navigate({ to: target as "/dashboard" });
    }, 380);
  };

  const onSequenceError = () => {
    setTimeout(() => {
      setPhase("idle");
      setErrorAt(null);
      const msg = mode === "login"
        ? "Email ou mot de passe incorrect."
        : "Erreur lors de la création du compte.";
      setToast({ type: "error", msg });
      setTimeout(() => setToast(null), 4000);
    }, 600);
  };

  const submitting = phase === "submitting";
  const exiting = phase === "exiting";

  const D = { logo: 0, title: 100, sub: 200, toggle: 300, fields: 400, btn: 700, oauth: 850, footer: 1000 };

  if (phase === "done") {
    return (
      <div className="relative w-full max-w-[420px]">
        <div className="mk-auth-card p-8 text-center text-[13px] text-zinc-400">
          Redirection en cours…
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[420px]">
      {toast && (
        <div className="auth-toast-in absolute -top-14 left-0 right-0 mx-auto max-w-[360px] rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-[12.5px] text-red-300 flex items-center gap-2 z-40">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {toast.msg}
        </div>
      )}

      <div className={"mk-auth-card p-8 sm:p-9 relative " + (exiting ? "card-exit" : "")}>
        <PlanDetailsModal open={showPlanDetails} onClose={() => setShowPlanDetails(false)} value={plan} onChange={setPlan} />
        {submitting && (
          <SubmitSequence
            mode={mode}
            errorAt={errorAt}
            onSettled={onSequenceSettled}
            onError={onSequenceError}
            plan={plan}
          />
        )}

        <div style={{ opacity: submitting ? 0.55 : 1, pointerEvents: submitting ? "none" : "auto", transition: "opacity 200ms" }}>
          <div className="fade-up flex justify-center mb-7" style={{ animationDelay: `${D.logo}ms` }}>
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          <div key={contentKey} className="text-center mb-6">
            <h1 className="fade-up text-[24px] font-medium tracking-tight text-zinc-50" style={{ animationDelay: `${D.title}ms` }}>
              {mode === "login" ? "Bon retour." : "Créer un accès Monark."}
            </h1>
            <p className="fade-up mt-1.5 text-[13.5px] text-zinc-500" style={{ animationDelay: `${D.sub}ms` }}>
              {mode === "login"
                ? "Reprenez là où vous vous êtes arrêté."
                : (plan === "free" ? "10 crédits offerts pour commencer." : `Plan ${PLAN_META[plan].name} · ${PLAN_META[plan].credits}.`)}
            </p>
          </div>

          <div className="fade-up relative bg-white/[0.02] p-1 rounded-lg mb-6" style={{ animationDelay: `${D.toggle}ms` }}>
            <div
              className="absolute top-1 bottom-1 rounded-md bg-white/[0.08] transition-all duration-300"
              style={{
                width: "calc(50% - 4px)",
                left: mode === "login" ? "4px" : "calc(50% + 0px)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            />
            <div className="relative grid grid-cols-2 text-[13px] font-medium">
              <button type="button" onClick={() => switchMode("login")} className={"py-2 transition-colors " + (mode === "login" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}>Connexion</button>
              <button type="button" onClick={() => switchMode("signup")} className={"py-2 transition-colors " + (mode === "signup" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}>Inscription</button>
            </div>
          </div>

          <form onSubmit={onSubmit} key={contentKey + ":form"} className="space-y-4">
            <div className="fade-up" style={{ animationDelay: `${D.fields}ms` }}>
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
                rightSlot={!errEmail && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? <Check className="w-3.5 h-3.5 text-emerald-400/60" /> : null}
              />
            </div>

            <div className="fade-up" style={{ animationDelay: `${D.fields + 60}ms` }}>
              <Field
                label="Mot de passe"
                type={showPwd ? "text" : "password"}
                name="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={pwd}
                onChange={setPwd}
                onBlur={() => validatePwd(pwd)}
                error={errPwd}
                placeholder={mode === "signup" ? "Min. 8 caractères" : "••••••••"}
                rightSlot={
                  <button type="button" onClick={() => setShowPwd((s) => !s)} className="text-zinc-500 hover:text-zinc-300 transition-colors" tabIndex={-1}>
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {mode === "signup" && <PasswordStrength pwd={pwd} />}
              {mode === "login" && (
                <div className="flex justify-end mt-1.5">
                  <button type="button" onClick={() => setForgotOpen(true)} className="text-[11.5px] text-zinc-500 hover:text-zinc-300 transition-colors">
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>

            {mode === "signup" && (
              <div className="fade-up" style={{ animationDelay: `${D.fields + 120}ms` }}>
                <Field
                  label="Confirmer le mot de passe"
                  type={showPwd ? "text" : "password"}
                  name="password-confirm"
                  autoComplete="new-password"
                  value={pwd2}
                  onChange={setPwd2}
                  onBlur={() => validatePwd2(pwd2)}
                  error={errPwd2}
                  placeholder="••••••••"
                  rightSlot={!errPwd2 && pwd2 && pwd2 === pwd && pwd.length >= 8 ? <Check className="w-3.5 h-3.5 text-emerald-400/60" /> : null}
                />
              </div>
            )}

            {mode === "signup" && (
              <div className="fade-up" style={{ animationDelay: `${D.fields + 180}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-medium text-zinc-300">Choisir un plan</span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <span>modifiable plus tard</span>
                    <span className="text-zinc-700">·</span>
                    <button type="button" onClick={() => setShowPlanDetails(true)} className="text-blue-400 hover:text-blue-300 transition-colors underline-offset-2 hover:underline">Détails</button>
                  </span>
                </div>
                <PlanPicker value={plan} onChange={setPlan} />
              </div>
            )}

            {mode === "signup" && (
              <div className="fade-up pt-1" style={{ animationDelay: `${D.fields + 220}ms` }}>
                <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                  <span className="relative mt-0.5 shrink-0">
                    <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); if (e.target.checked) setErrAccept(null); }} className="peer sr-only" />
                    <span className={"block w-4 h-4 rounded-[4px] transition-all " + (accepted ? "bg-blue-500" : "bg-white/[0.04] border border-white/[0.12] group-hover:border-white/25")}>
                      {accepted && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 m-[1.5px]"><polyline points="20 6 9 17 4 12" /></svg>}
                    </span>
                  </span>
                  <span className="text-[12.5px] text-zinc-400 leading-snug">
                    J'accepte les <span className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline cursor-pointer">CGU</span> et la <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline">politique de confidentialité</a>.
                  </span>
                </label>
                {errAccept && (
                  <div className="flex items-center gap-1.5 text-[11.5px] text-red-400/90 mt-1.5 pl-6">
                    <AlertCircle className="w-3 h-3" /> {errAccept}
                  </div>
                )}
              </div>
            )}

            <div className="fade-up pt-1" style={{ animationDelay: `${D.btn}ms` }}>
              <button
                type="submit"
                disabled={apiLoading || submitting}
                className="btn-shimmer w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[14px] font-medium transition-all duration-150 hover:-translate-y-[1px] flex items-center justify-center gap-2"
                style={{ boxShadow: "0 8px 30px -8px rgba(59,130,246,0.5)" }}
              >
                {apiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "login" ? "Connexion…" : "Création…"}
                  </>
                ) : (
                  <>
                {mode === "login"
                  ? "Se connecter"
                  : (plan === "free" ? "Créer mon compte" : `Continuer avec ${PLAN_META[plan].name}`)}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="fade-up flex items-center gap-3 my-5" style={{ animationDelay: `${D.btn + 80}ms` }}>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="font-mono text-[10px] tracking-wider text-zinc-600">OU</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="fade-up grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ animationDelay: `${D.oauth}ms` }}>
            <div className="oauth-soon relative h-10 rounded-lg bg-white/[0.015] border border-white/[0.05] text-zinc-500 text-[13px] flex items-center justify-center gap-2 opacity-70 cursor-not-allowed select-none" aria-disabled="true">
              <Mail className="w-4 h-4 text-zinc-500" /> Google
              <span className="soon-ribbon">Prochainement</span>
            </div>
            <div className="oauth-soon relative h-10 rounded-lg bg-white/[0.015] border border-white/[0.05] text-zinc-500 text-[13px] flex items-center justify-center gap-2 opacity-70 cursor-not-allowed select-none" aria-disabled="true">
              <GithubIcon className="w-4 h-4 text-zinc-500" /> GitHub
              <span className="soon-ribbon">Prochainement</span>
            </div>
          </div>

          <div className="fade-up text-center mt-7 text-[12.5px] text-zinc-500" style={{ animationDelay: `${D.footer}ms` }}>
            {mode === "login" ? (
              <>Pas encore de compte ?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="text-blue-400 hover:text-blue-300 transition-colors">Inscrivez-vous</button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button type="button" onClick={() => switchMode("login")} className="text-blue-400 hover:text-blue-300 transition-colors">Connectez-vous</button>
              </>
            )}
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <div className="text-center mt-6 font-mono text-[10px] text-zinc-600 tracking-wider">
        <button type="button" onClick={() => setForceFail((f) => !f)} className="hover:text-zinc-400 transition-colors">
          [{forceFail ? "×" : " "}] Simuler erreur
        </button>
        <span className="mx-2">·</span>
        protégé par Monark
      </div>
    </div>
  );
}