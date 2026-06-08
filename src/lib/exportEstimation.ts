function flatten(
  obj: unknown,
  prefix = "",
  rows: [string, string][] = [],
): [string, string][] {
  if (obj === null || obj === undefined) {
    rows.push([prefix, ""]);
  } else if (Array.isArray(obj)) {
    if (obj.length === 0) rows.push([prefix, "[]"]);
    else
      obj.forEach((v, i) =>
        flatten(v, prefix ? `${prefix}.${i}` : `${i}`, rows),
      );
  } else if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) rows.push([prefix, "{}"]);
    else
      entries.forEach(([k, v]) =>
        flatten(v, prefix ? `${prefix}.${k}` : k, rows),
      );
  } else {
    rows.push([prefix, String(obj)]);
  }
  return rows;
}

function csvCell(s: string): string {
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadEstimationCsv(
  result:
    | { raw?: unknown; inputs?: { model?: string; flow?: string } }
    | null
    | undefined,
): void {
  if (!result || result.raw == null) return;
  const rows = flatten(result.raw);
  const csv = [
    "chemin;valeur",
    ...rows.map(([k, v]) => `${csvCell(k)};${csvCell(v)}`),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const model = String(result.inputs?.model ?? "estimation").replace(
    /[^a-z0-9]+/gi,
    "_",
  );
  const flow = result.inputs?.flow ?? "buy";
  a.href = url;
  a.download = `monark_${model}_${flow}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}