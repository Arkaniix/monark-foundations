import {
  LayoutDashboard,
  Calculator,
  Layers,
  Eye,
  Boxes,
  Wrench,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import Logo from "../ui/Logo";

type AppSidebarUser = {
  subscription_tier: "free" | "standard" | "pro";
  credits_remaining: number;
};

type AppSidebarProps = {
  activePath?: string;
  user: AppSidebarUser;
  onLogout?: () => void;
};

const PLAN_CAPS: Record<AppSidebarUser["subscription_tier"], number> = {
  free: 10,
  standard: 180,
  pro: 600,
};

type IconComponent = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

type ToolItem = {
  to: string;
  label: string;
  Icon: IconComponent;
};

const TOOLS: ToolItem[] = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/estimator", label: "Estimateur", Icon: Calculator },
  { to: "/catalogue", label: "Catalogue", Icon: Layers },
  { to: "/watchlist", label: "Watchlist", Icon: Eye },
  { to: "/stock", label: "Inventaire", Icon: Boxes },
  { to: "/repair", label: "Repair Guide", Icon: Wrench },
];

export default function AppSidebar({
  activePath,
  user,
  onLogout,
}: AppSidebarProps) {
  const cap = PLAN_CAPS[user.subscription_tier];
  const remaining = user.credits_remaining;
  const pct = Math.min(100, Math.max(0, (remaining / cap) * 100));
  const fillColor = pct > 50 ? "#10B981" : pct > 20 ? "#F59E0B" : "#EF4444";

  return (
    <aside
      className="sticky top-0 z-40 hidden h-screen flex-col md:flex"
      style={{
        width: 240,
        background: "var(--mk-card-deep)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid var(--mk-section-border)",
      }}
    >
      {/* Header */}
      <div
        className="flex h-14 items-center px-5"
        style={{ borderBottom: "1px solid var(--mk-section-border)" }}
      >
        <Logo />
      </div>

      {/* Nav */}
      <nav className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          OUTILS
        </div>
        <ul className="flex flex-col gap-0.5">
          {TOOLS.map((it) => (
            <NavItem
              key={it.to}
              to={it.to}
              label={it.label}
              Icon={it.Icon}
              active={activePath === it.to}
            />
          ))}
        </ul>

        <div className="mb-2 mt-6 px-3 font-mono text-[10px] tracking-[0.2em] text-zinc-600">
          COMPTE
        </div>
        <ul className="flex flex-col gap-0.5">
          <NavItem
            to="/settings"
            label="Paramètres"
            Icon={SettingsIcon}
            active={activePath?.startsWith("/settings") ?? false}
          />
          <NavItem
            label="Déconnexion"
            Icon={LogOut}
            onClick={onLogout}
            active={false}
          />
        </ul>
      </nav>

      {/* Footer crédits */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid var(--mk-section-border)" }}
      >
        <div className="mk-subcard-soft p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-wider text-zinc-500">
              CRÉDITS
            </span>
            <span className="font-mono text-[12px] tabular-nums text-zinc-200">
              {remaining}
              <span className="text-zinc-600"> / {cap}</span>
            </span>
          </div>
          <div
            className="mt-2 h-1 overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: fillColor,
                transition: "width 700ms cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
          <button
            type="button"
            className="ease-expo mt-3 w-full text-left font-mono text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Recharger →
          </button>
        </div>
      </div>
    </aside>
  );
}

type NavItemProps = {
  to?: string;
  label: string;
  Icon: IconComponent;
  active?: boolean;
  onClick?: () => void;
};

function NavItem({ to, label, Icon, active = false, onClick }: NavItemProps) {
  const handleButtonClick = () => {
    onClick?.();
  };

  const className =
    "ease-expo flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors " +
    (active
      ? "text-zinc-50"
      : "text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-100");

  const style = active ? { background: "var(--mk-surface-2)" } : undefined;

  const iconEl = (
    <Icon
      className={"h-4 w-4 " + (active ? "text-zinc-100" : "text-zinc-500")}
      strokeWidth={1.5}
    />
  );

  return (
    <li className="relative">
      {active && (
        <div
          aria-hidden="true"
          className="absolute bottom-1.5 left-0 top-1.5 w-[2px] rounded-r"
          style={{ background: "#3B82F6" }}
        />
      )}
      {to && !onClick ? (
        <a href={to} className={className} style={style}>
          {iconEl}
          <span>{label}</span>
        </a>
      ) : (
        <button
          type="button"
          onClick={handleButtonClick}
          className={className + " w-full text-left"}
          style={style}
        >
          {iconEl}
          <span>{label}</span>
        </button>
      )}
    </li>
  );
}
