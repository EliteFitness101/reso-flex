/** Export helpers — CSV (dependency-free) + native XLSX (SheetJS). */
import * as XLSX from "xlsx";

export type ColKind = "text" | "currency_ngn" | "date" | "number";
export interface ColumnSpec<T = any> {
  key: string;
  header: string;
  kind?: ColKind;
  get?: (row: T) => any;
}

/* --------------------------------- CSV --------------------------------- */

export function exportCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const cols = Array.from(rows.reduce<Set<string>>((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set()));
  const esc = (v: unknown) => {
    if (v == null) return "";
    let s = typeof v === "object" ? JSON.stringify(v) : String(v);
    // CSV formula-injection guard: neutralise spreadsheet-executable prefixes.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const csv = [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/* --------------------------------- XLSX -------------------------------- */

interface XlsxOptions<T> {
  sheetName?: string;
  columns?: ColumnSpec<T>[];
  title?: string;
}

/**
 * Build a real .xlsx workbook: currency/date formatting, auto-filter,
 * frozen header row, auto-sized columns, workbook metadata.
 * Backwards compatible: if `columns` omitted, keys of first row are used.
 */
export function exportXlsx<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  opts: XlsxOptions<T> = {},
) {
  if (!rows.length) return;

  const columns: ColumnSpec<T>[] =
    opts.columns ??
    Object.keys(rows[0]).map(k => ({ key: k, header: k, kind: "text" as ColKind }));

  const headers = columns.map(c => c.header);
  const aoa: any[][] = [headers];

  for (const row of rows) {
    aoa.push(
      columns.map(col => {
        const raw = col.get ? col.get(row) : row[col.key as keyof T];
        if (raw == null || raw === "") return null;
        if (col.kind === "date") {
          const d = raw instanceof Date ? raw : new Date(raw as any);
          return isNaN(d.getTime()) ? String(raw) : d;
        }
        if (col.kind === "currency_ngn") {
          const n = typeof raw === "number" ? raw : Number(raw);
          return isNaN(n) ? null : n / 100; // kobo → naira
        }
        if (col.kind === "number") {
          const n = typeof raw === "number" ? raw : Number(raw);
          return isNaN(n) ? null : n;
        }
        return typeof raw === "object" ? JSON.stringify(raw) : raw;
      }),
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true });

  // Apply per-column number/date formats
  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let c = 0; c < columns.length; c++) {
    const kind = columns[c].kind;
    if (!kind || kind === "text") continue;
    for (let r = 1; r <= range.e.r; r++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell || cell.v == null) continue;
      if (kind === "date") {
        cell.t = "d";
        cell.z = "yyyy-mm-dd hh:mm";
      } else if (kind === "currency_ngn") {
        cell.t = "n";
        cell.z = '"₦"#,##0.00';
      } else if (kind === "number") {
        cell.t = "n";
        cell.z = "#,##0";
      }
    }
  }

  // Freeze header row + auto-filter
  ws["!freeze"] = { xSplit: 0, ySplit: 1 } as any;
  (ws as any)["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: range.e.r, c: range.e.c } }) };
  ws["!views"] = [{ state: "frozen", ySplit: 1 } as any];

  // Auto-size columns from max content length
  ws["!cols"] = columns.map((col, ci) => {
    let max = col.header.length;
    for (let r = 1; r <= range.e.r; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: ci })];
      if (!cell) continue;
      const s = cell.w ?? (cell.v instanceof Date ? cell.v.toISOString().slice(0, 16) : String(cell.v ?? ""));
      if (s.length > max) max = s.length;
    }
    return { wch: Math.min(Math.max(max + 2, 10), 40) };
  });

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: opts.title ?? filename,
    Author: "ResoFlex Revenue OS",
    CreatedDate: new Date(),
  };
  XLSX.utils.book_append_sheet(wb, ws, (opts.sheetName ?? "Sheet1").slice(0, 31));

  const name = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, name, { compression: true });
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ngn(kobo?: number | null) {
  if (typeof kobo !== "number") return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}
