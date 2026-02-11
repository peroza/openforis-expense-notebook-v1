import type Expense from "@/src/types/Expense";

let pendingExpense: Expense | null = null;

export const setPendingExpense = (expense: Expense) => {
  pendingExpense = expense;
};

export const getAndClearPendingExpense = (): Expense | null => {
  const expense = pendingExpense;
  pendingExpense = null; // Clear after reading
  return expense;
};