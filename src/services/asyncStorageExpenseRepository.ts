import AsyncStorage from "@react-native-async-storage/async-storage";
import type Expense from "@/src/types/Expense";
import type { ExpenseRepository } from "@/src/services/expenseRepository";

const EXPENSES_STORAGE_KEY = "@expenses_list";

export class AsyncStorageExpenseRepository implements ExpenseRepository {
  async list(): Promise<Expense[]> {
    const raw = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Expense[];
  }

  async replaceAll(expenses: Expense[]): Promise<void> {
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  }

  async create(expense: Expense): Promise<void> {
    const current = await this.list();
    current.push(expense);
    await this.replaceAll(current);
  }

  async update(expense: Expense): Promise<void> {
    const current = await this.list();
    const next = current.map((e) => (e.id === expense.id ? expense : e));
    await this.replaceAll(next);
  }

  async remove(id: string): Promise<void> {
    const current = await this.list();
    const next = current.filter((e) => e.id !== id);
    await this.replaceAll(next);
  }
}