export const EXPENSE_CATEGORIES = [
  "Food",
  "Housing",
  "Transportation",
  "Bills",
  "Supplies",
  "Labor",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Background and text color for category chips. Unknown categories use Other. */
export const CATEGORY_CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  Food: { bg: "#dcfce7", text: "#166534" },
  Housing: { bg: "#dbeafe", text: "#1e40af" },
  Transportation: { bg: "#ffedd5", text: "#c2410c" },
  Bills: { bg: "#fce7f3", text: "#9d174d" },
  Supplies: { bg: "#e9d5ff", text: "#6b21a8" },
  Labor: { bg: "#cffafe", text: "#0e7490" },
  Other: { bg: "#f3f4f6", text: "#4b5563" },
};

export function getCategoryChipColors(category: string): { bg: string; text: string } {
  return CATEGORY_CHIP_COLORS[category] ?? CATEGORY_CHIP_COLORS.Other;
}