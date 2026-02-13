import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type Expense from "@/src/types/Expense";
import { AsyncStorageExpenseRepository } from "@/src/services/asyncStorageExpenseRepository";

type AddExpenseInput = Omit<Expense, "id">;

type ExpensesContextValue = {
  expenses: Expense[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  addExpense: (input: AddExpenseInput) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
};

const ExpensesContext = createContext<ExpensesContextValue | undefined>(
  undefined,
);

const MOCK_EXPENSES: Expense[] = [
  {
    id: "1",
    title: "Groceries",
    amount: 100,
    date: "2026-01-01",
    category: "Food",
    paymentMethod: "Cash",
  },
  {
    id: "2",
    title: "Rent",
    amount: 1000,
    date: "2026-01-02",
    category: "Housing",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "3",
    title: "Utilities",
    amount: 100,
    date: "2026-01-03",
    category: "Bills",
    note: "Electricity bill",
  },
];

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const repository = useMemo(() => new AsyncStorageExpenseRepository(), []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const list = await repository.list();
    setExpenses(list);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      const list = await repository.list();

      if (list.length === 0) {
        await repository.replaceAll(MOCK_EXPENSES);
        setExpenses(MOCK_EXPENSES);
      } else {
        setExpenses(list);
      }

      setIsLoading(false);
    };

    void bootstrap();
  }, [repository]);

  const addExpense = async (input: AddExpenseInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await repository.create({ id, ...input });
    await refresh();
  };

  const updateExpense = async (expense: Expense) => {
    await repository.update(expense);
    await refresh();
  };

  const deleteExpense = async (id: string) => {
    await repository.remove(id);
    await refresh();
  };

  const getExpenseById = (id: string) => expenses.find((e) => e.id === id);

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        isLoading,
        refresh,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenseById,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) {
    throw new Error("useExpenses must be used inside ExpensesProvider");
  }
  return ctx;
}
