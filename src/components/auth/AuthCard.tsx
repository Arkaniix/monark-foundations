import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Check, Eye, EyeOff, ArrowRight, Mail, Github as GithubIcon } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Field from "./Field";
import PasswordStrength from "./PasswordStrength";

type AuthMode = "login" | "signup";

export default function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("login");
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

  const switchMode = (m: AuthMode) => {
    if (m === mode) return;
    setMode(m);
    setContentKey((k) => k + 1);
    setErrEmail(null); setErrPwd(null); setErrPwd2(null); setErrAccept(null);
  };

  const validateEmail = (v: string) => {
    if (!v) { setErrEmail("Email requis"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setErrEmail("Format email invalide"); return false; }
    setErrEmail(null); return true;
  };
  const validatePwd = (v: string) => {
    if (!v) { setErrPwd("Mot de passe requis"); return false; }
    if (mode === "signup" && v.length < 8) { setErrPwd("Minimum 8 caractères"); return false; }
    setErrPwd(null); return true;
  };
  const validatePwd2 = (v: string) => {
    if (mode !== "signup") return true;
    if (v !== pwd) { setErrPwd2("Les mots de passe ne correspondent pas"); return false; }
    setErrPwd2(null); return true;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const okE = validateEmail(email);
    const okP = validatePwd(pwd);
    const okP2 = validatePwd2(pwd2);
    let okA = true;
    if (mode === "signup" && !accepted) { setErrAccept("Vous devez accepter les CGU"); okA = false; }
    else setErrAccept(null);
    if (!okE || !okP || !okP2 || !okA) return;
    console.log("[P3.2b] Form submitted (wiring API à venir en P3.3)", { mode, email });
  };

  const oauthClick = () => alert("OAuth pas encore disponible — utilise email/password.");

  const D = { logo: 0, title: 100, sub: 200, toggle: 300, fields: 400, btn: 700, oauth: 850, footer: 1000 };

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="mk-auth-card p-8 sm:p-9 relative">
        <div>
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
              {mode === "login" ? "Reprenez là où vous vous êtes arrêté." : "10 crédits offerts pour commencer."}
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
              <button onClick={() => switchMode("login")} className={"py-2 transition-colors " + (mode === "login" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}>Connexion</button>
              <button onClick={() => switchMode("signup")} className={"py-2 transition-colors " + (mode === "signup" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300")}>Inscription</button>
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
                rightSlot={!errEmail && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? <Check className="w-3.5 h-3.5 text-emerald-400/60"/> : null}
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
                    {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                }
              />
              {mode === "signup" && <PasswordStrength pwd={pwd}/>}
              {mode === "login" && (
                <div className="flex justify-end mt-1.5">
                  <button type="button" className="text-[11.5px] text-zinc-500 hover:text-zinc-300 transition-colors">Mot de passe oublié ?</button>
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
                  rightSlot={!errPwd2 && pwd2 && pwd2 === pwd && pwd.length >= 8 ? <Check className="w-3.5 h-3.5 text-emerald-400/60"/> : null}
                />
              </div>
            )}

            {mode === "signup" && (
              <div className="fade-up pt-1" style={{ animationDelay: `${D.fields + 180}ms` }}>
                <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                  <span className="relative mt-0.5 shrink-0">
                    <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); if (e.target.checked) setErrAccept(null); }} className="peer sr-only"/>
                    <span className={"block w-4 h-4 rounded-[4px] transition-all " + (accepted ? "bg-blue-500" : "bg-white/[0.04] border border-white/[0.12] group-hover:border-white/25")}>
                      {accepted && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 m-[1.5px]"><polyline points="20 6 9 17 4 12"/></svg>}
                    </span>
                  </span>
                  <span className="text-[12.5px] text-zinc-400 leading-snug">
                    J'accepte les <span className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline cursor-pointer">CGU</span> et la <span className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline cursor-pointer">politique de confidentialité</span>.
                  </span>
                </label>
                {errAccept && (
                  <div className="flex items-center gap-1.5 text-[11.5px] text-red-400/90 mt-1.5 pl-6">
                    <AlertCircle className="w-3 h-3"/> {errAccept}
                  </div>
                )}
              </div>
            )}

            <div className="fade-up pt-1" style={{ animationDelay: `${D.btn}ms` }}>
              <button
                type="submit"
                className="btn-shimmer w-full h-11 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-medium transition-all duration-150 hover:-translate-y-[1px] flex items-center justify-center gap-2"
                style={{ boxShadow: "0 8px 30px -8px rgba(59,130,246,0.5)" }}
              >
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
                <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          </form>

          <div className="fade-up flex items-center gap-3 my-5" style={{ animationDelay: `${D.btn + 80}ms` }}>
            <div className="flex-1 h-px bg-white/[0.06]"/>
            <span className="font-mono text-[10px] tracking-wider text-zinc-600">OU</span>
            <div className="flex-1 h-px bg-white/[0.06]"/>
          </div>

          <div className="fade-up grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ animationDelay: `${D.oauth}ms` }}>
            <button type="button" onClick={oauthClick} className="h-10 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-zinc-300 text-[13px] flex items-center justify-center gap-2 transition-colors">
              <Mail className="w-4 h-4 text-zinc-400"/> Google
            </button>
            <button type="button" onClick={oauthClick} className="h-10 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-zinc-300 text-[13px] flex items-center justify-center gap-2 transition-colors">
              <GithubIcon className="w-4 h-4 text-zinc-400"/> GitHub
            </button>
          </div>

          <div className="fade-up text-center mt-7 text-[12.5px] text-zinc-500" style={{ animationDelay: `${D.footer}ms` }}>
            {mode === "login" ? (
              <>Pas encore de compte ?{" "}
                <button onClick={() => switchMode("signup")} className="text-blue-400 hover:text-blue-300 transition-colors">Inscrivez-vous</button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button onClick={() => switchMode("login")} className="text-blue-400 hover:text-blue-300 transition-colors">Connectez-vous</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}