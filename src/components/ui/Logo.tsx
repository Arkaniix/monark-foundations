import markUrl from "@/assets/monark-mark.svg";

export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={markUrl}
        alt="Monark"
        className="h-7 w-auto"
        style={{ filter: "drop-shadow(0 0 14px rgba(150, 207, 36, 0.25))" }}
      />
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[15px] font-semibold"
          style={{ letterSpacing: "0.02em" }}
        >
          MONARK
        </span>
        <span className="font-mono text-[10px] text-zinc-500">v3.2</span>
      </div>
    </div>
  );
}