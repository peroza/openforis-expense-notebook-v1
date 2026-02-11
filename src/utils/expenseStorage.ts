import type Expense from "@/src/types/Expense";

let pendingExpense: Expense | null = null;
let expenseToUpdate: Expense | null = null;

export const setPendingExpense = (expense: Expense) => {
  pendingExpense = expense;
};

export const getAndClearPendingExpense = (): Expense | null => {
  const expense = pendingExpense;
  pendingExpense = null;
  return expense;
};

export const setExpenseToUpdate = (expense: Expense) => {
  expenseToUpdate = expense;
};

export const getAndClearExpenseToUpdate = (): Expense | null => {
  const expense = expenseToUpdate;
  expenseToUpdate = null;
  return expense;
};