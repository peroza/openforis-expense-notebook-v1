import type Expense from "@/src/types/Expense";

const CSV_HEADERS = [
  "Title",
  "Amount",
  "Date",
  "Category",
  "Note",
  "Payment Method",
];

function escapeCsvField(value: string): string {
  if (/[,"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts an array of expenses to a CSV string (UTF-8). Uses current
 * filter/sort order. Fields are escaped for commas, quotes, and newlines.
 */
export function expensesToCsv(expenses: Expense[]): string {
  const rows: string[] = [CSV_HEADERS.join(",")];

  for (const e of expenses) {
    const row = [
      escapeCsvField(e.title),
      String(e.amount),
      escapeCsvField(e.date),
      escapeCsvField(e.category ?? ""),
      escapeCsvField(e.note ?? ""),
      escapeCsvField(e.paymentMethod ?? ""),
    ];
    rows.push(row.join(","));
  }

  return rows.join("\n");
}
