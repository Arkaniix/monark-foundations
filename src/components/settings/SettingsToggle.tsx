type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
};

export default function SettingsToggle({
  checked,
  onChange,
  ariaLabel,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onChange(!checked);
      }}
      className="ease-expo relative flex-shrink-0 rounded-full transition-colors"
      style={{
        width: 32,
        height: 18,
        background: checked ? "#10B981" : "rgba(255,255,255,0.08)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        className="ease-expo absolute top-1/2 -translate-y-1/2 rounded-full transition-all"
        style={{
          width: 14,
          height: 14,
          background: "#fff",
          left: checked ? 16 : 2,
        }}
      />
    </button>
  );
}