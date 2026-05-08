import { Menu } from "lucide-react";
import UserMenu from "./UserMenu";

type AppTopbarUser = {
  email: string;
  full_name?: string;
  subscription_tier: "free" | "standard" | "pro";
};

type AppTopbarProps = {
  pageLabel?: string;
  user: AppTopbarUser;
  onLogout: () => void;
  onToggleMobileNav?: () => void;
};

export default function AppTopbar({
  pageLabel = "DASHBOARD",
  user,
  onLogout,
  onToggleMobileNav,
}: AppTopbarProps) {
  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center justify-between px-6"
      style={{
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--mk-section-border)",
      }}
    >
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="-ml-1 rounded p-1.5 text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100 md:hidden"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
        <div className="font-mono text-[12px] tracking-wider">
          <span className="text-zinc-600">MONARK</span>
          <span className="px-2 text-zinc-700">/</span>
          <span className="text-zinc-300">{pageLabel}</span>
        </div>
      </div>

      <UserMenu user={user} onLogout={onLogout} />
    </header>
  );
}
