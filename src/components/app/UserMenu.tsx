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
  const ref = useRef<HTMLDivElement>(null);

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
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] text-zinc-200"
          style={{ background: "var(--mk-surface-3)" }}
        >
          {initials}
        </div>
        <span className="hidden max-w-[160px] truncate text-[12.5px] text-zinc-300 sm:inline">
          {user.email}
        </span>
        <ChevronDown
          className="h-4 w-4 text-zinc-500"
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          className="mk-card-flat fade-up absolute right-0 top-full mt-2 w-64 overflow-hidden"
          style={{ animationDuration: "220ms" }}
          role="menu"
        >
          <div className="p-3">
            <div className="truncate text-[12px] text-zinc-300">
              {user.email}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-wider text-zinc-500">
                PLAN
              </span>
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                style={{
                  background: "rgba(59,130,246,0.12)",
                  color: "#60A5FA",
                }}
              >
                {planLabel}
              </span>
            </div>
          </div>
          <div
            style={{
              height: 1,
              background: "var(--mk-divider-soft)",
            }}
          />
          <a
            href="/settings"
            className="ease-expo flex items-center gap-2.5 px-3 py-2.5 text-[12.5px] text-zinc-300 transition-colors hover:bg-white/[0.03] hover:text-zinc-50"
            role="menuitem"
          >
            <SettingsIcon
              className="h-4 w-4 text-zinc-500"
              strokeWidth={1.5}
            />
            Paramètres
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="ease-expo flex w-full items-center gap-2.5 px-3 py-2.5 text-[12.5px] text-zinc-300 transition-colors hover:bg-white/[0.03] hover:text-zinc-50"
            role="menuitem"
          >
            <LogOut
              className="h-4 w-4 text-zinc-500"
              strokeWidth={1.5}
            />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
