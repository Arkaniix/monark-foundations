import { Pencil, Trash2 } from "lucide-react";
import StockKebabMenu, { type KebabAction } from "./StockKebabMenu";
import {
  ACCOUNTING_CATEGORIES_META,
  KIND_COLOR,
  KIND_LABEL,
  formatDateShortFR,
  formatSignedEur,
  type AccountingEntry,
} from "./accountingDatasets";

type Props = {
  entries: AccountingEntry[];
  onEdit: (entry: AccountingEntry) => void;
  onDelete: (id: string) => void;
};

export default function StockComptesTableFlat({
  entries,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: "rgba(255,255,255,0.01)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Th className="w-[12%]">DATE</Th>
            <Th className="w-[12%]">TYPE</Th>
            <Th className="w-[24%]">CATÉGORIE</Th>
            <Th>NOTE</Th>
            <Th className="w-[14%] text-right">MONTANT</Th>
            <Th className="w-[40px]" />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <Row
              key={e.id}
              entry={e}
              actions={buildActions(e, onEdit, onDelete)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildActions(
  entry: AccountingEntry,
  onEdit: (e: AccountingEntry) => void,
  onDelete: (id: string) => void,
): KebabAction[] {
  return [
    {
      key: "edit",
      label: "Modifier",
      icon: Pencil,
      onClick: () => onEdit(entry),
    },
    {
      key: "delete",
      label: "Supprimer",
      icon: Trash2,
      destructive: true,
      separatorBefore: true,
      onClick: () => onDelete(entry.id),
    },
  ];
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-zinc-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Row({
  entry,
  actions,
}: {
  entry: AccountingEntry;
  actions: KebabAction[];
}) {
  const meta = ACCOUNTING_CATEGORIES_META[entry.category];
  const Icon = meta.icon;
  const color = KIND_COLOR[entry.kind];
  return (
    <tr
      className="group transition-colors hover:bg-white/[0.025]"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <td className="px-3 py-2 text-[12.5px] text-zinc-400">
        {formatDateShortFR(entry.date)}
      </td>
      <td className="px-3 py-2">
        <span
          className="font-mono font-medium"
          style={{
            fontSize: 9,
            letterSpacing: "0.12em",
            padding: "3px 6px",
            borderRadius: 3,
            background:
              entry.kind === "expense"
                ? "rgba(239,68,68,0.10)"
                : "rgba(16,185,129,0.10)",
            color,
          }}
        >
          {KIND_LABEL[entry.kind]}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Icon className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
          </div>
          <span className="text-[12.5px] text-zinc-300">{meta.label}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-[12.5px] text-zinc-400">
        <div className="truncate">{entry.note || "—"}</div>
      </td>
      <td
        className="px-3 py-2 text-right font-mono text-[12px] tabular-nums"
        style={{ color }}
      >
        {formatSignedEur(entry)}
      </td>
      <td className="px-1 py-2 text-right">
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <StockKebabMenu actions={actions} />
        </div>
      </td>
    </tr>
  );
}