import { View, Text, FlatList, Button, Alert } from "react-native";
import { Link } from "expo-router";
import WelcomeMessage from "@/src/components/WelcomeMessage";
import ExpenseItem from "@/src/components/ExpenseItem";
import type Expense from "@/src/types/Expense";
import React, { useState, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import {
  getAndClearPendingExpense,
  getAndClearExpenseToUpdate,
  getStoredExpenses,
  saveExpenses,
} from "@/src/utils/expenseStorage";

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

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from storage on mount
  useEffect(() => {
    const loadExpenses = async () => {
      const stored = await getStoredExpenses();
      if (stored.length === 0) {
        // First time: use mock data
        setExpenses(MOCK_EXPENSES);
        await saveExpenses(MOCK_EXPENSES);
      } else {
        setExpenses(stored);
      }
      setIsLoading(false);
    };
    loadExpenses();
  }, []);

  // Save expenses to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoading]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setExpenses((prev) => prev.filter((exp) => exp.id !== id));
          },
        },
      ],
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      // Handle new expense
      const pending = getAndClearPendingExpense();
      if (pending) {
        setExpenses((prev) => [...prev, pending]);
      }

      // Handle updated expense
      const updated = getAndClearExpenseToUpdate();
      if (updated) {
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === updated.id ? updated : exp)),
        );
      }
    }, []),
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <WelcomeMessage
        title="Expenses"
        subtitle="This will show your expenses list"
      />
      <Link href="/add-expense">
        <Text style={{ color: "blue", marginTop: 16 }}>Add New Expense</Text>
      </Link>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem expense={item} onDelete={handleDelete} />
        )}
        style={{ flex: 1, paddingHorizontal: 0, width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 32, width: "100%" }}
      />
      <Link href="/">
        <Text style={{ color: "blue", marginTop: 16 }}>Back to home</Text>
      </Link>
    </View>
  );
}
