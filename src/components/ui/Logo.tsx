export default function Logo() {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="text-[15px] font-semibold"
        style={{ letterSpacing: "0.02em" }}
      >
        MONARK
      </span>
      <span className="font-mono text-[10px] text-zinc-500">v3.2</span>
    </div>
  );
}