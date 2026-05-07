type Props = { pwd: string };

export default function PasswordStrength({ pwd }: Props) {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 25;
  if (/[0-9]/.test(pwd)) score += 25;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
  let label = "Faible";
  let color = "#EF4444";
  if (score > 25 && score <= 50) { label = "Moyen"; color = "#F59E0B"; }
  else if (score > 50 && score < 100) { label = "Bon"; color = "#3B82F6"; }
  else if (score === 100) { label = "Excellent"; color = "#10B981"; }
  return (
    <div className="flex items-center gap-3 mt-2 px-0.5">
      <div className="relative flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${score}%`, background: color, boxShadow: `0 0 12px ${color}50` }}
        />
      </div>
      <span className="font-mono text-[10.5px]" style={{ color }}>{label}</span>
    </div>
  );
}
