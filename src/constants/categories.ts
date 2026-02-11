export const EXPENSE_CATEGORIES = [
    "Food",
    "Housing",
    "Transportation",
    "Bills",
    "Supplies",
    "Labor",
    "Other",
  ] as const;
  
  export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];