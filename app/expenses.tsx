import { View, Text, FlatList, Button } from "react-native";
import { Link } from "expo-router";
import WelcomeMessage from "@/src/components/WelcomeMessage";
import ExpenseItem from "@/src/components/ExpenseItem";
import type Expense from "@/src/types/Expense";
import React, { useState } from "react";

const MOCK_EXPENSES: Expense[] = [
  { id: "1", title: "Groceries", amount: 100, date: "2026-01-01" },
  { id: "2", title: "Rent", amount: 1000, date: "2026-01-02" },
  { id: "3", title: "Utilities", amount: 100, date: "2026-01-03" },
];

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);

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
        renderItem={({ item }) => <ExpenseItem expense={item} />}
      />
      <Link href="/">
        <Text style={{ color: "blue", marginTop: 16 }}>Back to home</Text>
      </Link>
    </View>
  );
}
