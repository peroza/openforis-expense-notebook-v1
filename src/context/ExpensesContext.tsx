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
import { HybridExpenseRepository } from "@/src/services/hybridExpenseRepository";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

type AddExpenseInput = Omit<Expense, "id">;

type ExpensesContextValue = {
  expenses: Expense[];
  isLoading: boolean;
  isSyncing: boolean;
  pendingSyncIds: Set<string>;
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
  const isOnline = useNetworkStatus();
  const repositoryRef = useRef<HybridExpenseRepository | null>(null);

  // Initialize repository once
  const repository = useMemo(() => {
    if (!repositoryRef.current) {
      repositoryRef.current = new HybridExpenseRepository(isOnline);
      console.log("🔄 Using HybridExpenseRepository");
    }
    return repositoryRef.current;
  }, []);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncIds, setPendingSyncIds] = useState<Set<string>>(new Set());
  const isSyncingRef = useRef(false);

  const refresh = useCallback(async () => {
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
      const ids = await repository.getPendingSyncExpenseIds();
      setPendingSyncIds(new Set(ids));
      console.log("✅ Refresh completed");
    } catch (error) {
      console.error("❌ Error refreshing expenses:", error);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [repository]);

  // Update online status when it changes
  useEffect(() => {
    repository.setOnlineStatus(isOnline);

    // When coming back online, sync the queue
    if (isOnline) {
      console.log("🌐 Back online, syncing queue...");
      void repository.processSyncQueue().then(() => {
        // Refresh expenses after sync
        void refresh();
      });
    }
  }, [isOnline, repository, refresh]);

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
        const ids = await repository.getPendingSyncExpenseIds();
        setPendingSyncIds(new Set(ids));
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      expenses,
      isLoading,
      isSyncing,
      pendingSyncIds,
      refresh,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpenseById,
    }),
    [
      expenses,
      isLoading,
      isSyncing,
      pendingSyncIds,
      refresh,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpenseById,
    ],
  );

  return (
    <ExpensesContext.Provider value={contextValue}>
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
