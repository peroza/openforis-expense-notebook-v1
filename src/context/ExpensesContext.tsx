import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import type Expense from "@/src/types/Expense";
import { AsyncStorageExpenseRepository } from "@/src/services/asyncStorageExpenseRepository";
import { FirestoreExpenseRepository } from "@/src/services/firestoreExpenseRepository";
import { db } from "@/src/config/firebase";

type AddExpenseInput = Omit<Expense, "id">;

type ExpensesContextValue = {
  expenses: Expense[];
  isLoading: boolean;
  isSyncing: boolean;
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
  const repository = useMemo(() => {
    if (db) {
      console.log("🔥 Using FirestoreExpenseRepository");
      return new FirestoreExpenseRepository();
    }
    console.log(
      "💾 Using AsyncStorageExpenseRepository (Firebase not configured)",
    );
    return new AsyncStorageExpenseRepository();
  }, []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false); // Use ref to track syncing state

  const refresh = useCallback(async () => {
    // Check ref instead of state to avoid dependency issues
    if (isSyncingRef.current) {
      console.log("⏸️ Refresh skipped - already syncing");
      return;
    }
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      console.log("🔄 Starting refresh...");
      const list = await repository.list();
      setExpenses(list);
      console.log("✅ Refresh completed");
    } catch (error) {
      console.error("❌ Error refreshing expenses:", error);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [repository]); // Remove isSyncing from dependencies!

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const list = await repository.list();

        if (list.length === 0) {
          await repository.replaceAll(MOCK_EXPENSES);
          setExpenses(MOCK_EXPENSES);
        } else {
          setExpenses(list);
        }
      } catch (error) {
        console.error("Error bootstrapping expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [repository]);

  const addExpense = useCallback(
    async (input: AddExpenseInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await repository.create({ id, ...input });
      await refresh();
    },
    [repository, refresh],
  );

  const updateExpense = useCallback(
    async (expense: Expense) => {
      await repository.update(expense);
      await refresh();
    },
    [repository, refresh],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await repository.remove(id);
      await refresh();
    },
    [repository, refresh],
  );

  const getExpenseById = useCallback(
    (id: string) => expenses.find((e) => e.id === id),
    [expenses],
  );

  return (
    <ExpensesContext.Provider
      value={{
        expenses,
        isLoading,
        isSyncing,
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
