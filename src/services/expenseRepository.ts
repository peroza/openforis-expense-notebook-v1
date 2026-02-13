import type Expense from "@/src/types/Expense";

export interface ExpenseRepository {
  list(): Promise<Expense[]>;
  replaceAll(expenses: Expense[]): Promise<void>;
  create(expense: Expense): Promise<void>;
  update(expense: Expense): Promise<void>;
  remove(id: string): Promise<void>;
}