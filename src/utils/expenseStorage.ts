import AsyncStorage from "@react-native-async-storage/async-storage";
import type Expense from "@/src/types/Expense";

const EXPENSES_STORAGE_KEY = "@expenses_list";


export const getStoredExpenses = async (): Promise<Expense[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Error reading expenses:", e);
      return [];
    }
  };
  
  export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error("Error saving expenses:", e);
    }
  };

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