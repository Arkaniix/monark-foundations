import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings as SettingsIcon } from "lucide-react";

type UserMenuUser = {
  email: string;
  full_name?: string;
  subscription_tier: "free" | "standard" | "pro";
};

type UserMenuProps = {
  user: UserMenuUser;
  onLogout: () => void;
};

const PLAN_LABELS: Record<UserMenuUser["subscription_tier"], string> = {
  free: "Free",
  standard: "Standard",
  pro: "Pro",
};

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = (user.full_name || user.email).slice(0, 2).toUpperCase();
  const planLabel = PLAN_LABELS[user.subscription_tier];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ease-expo flex items-center gap-2 rounded-md py-1 pl-1 pr-2.5 transition-colors hover:bg-white/[0.04]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] font-mono text-[10px] tracking-wider text-zinc-200">
          {initials}
        </span>
        <span className="text-[13px] text-zinc-300">{user.email}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </button>

      {open && (
        <div
          className="mk-card-flat fade-up absolute right-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden p-1.5"
          role="menu"
        >
          <div className="px-2.5 py-2">
            <div className="truncate text-[12px] text-zinc-400">
              {user.email}
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-mono text-[9px] tracking-widest text-zinc-500">
                PLAN
              </span>
              <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-zinc-200">
                {planLabel}
              </span>
            </div>
          </div>

          <div className="my-1 h-px bg-white/[0.06]" />

          <a
            href="/settings"
            className="ease-expo flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
            role="menuitem"
          >
            <SettingsIcon className="h-3.5 w-3.5 text-zinc-500" />
            Paramètres
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="ease-expo flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
            role="menuitem"
          >
            <LogOut className="h-3.5 w-3.5 text-zinc-500" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;