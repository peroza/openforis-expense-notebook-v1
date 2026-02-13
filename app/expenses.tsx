import { View, Text, FlatList, Alert } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import WelcomeMessage from "@/src/components/WelcomeMessage";
import ExpenseItem from "@/src/components/ExpenseItem";
import { useExpenses } from "@/src/context/ExpensesContext";
import { useCallback } from "react";

export default function ExpensesScreen() {
  const { expenses, isLoading, deleteExpense, refresh } = useExpenses();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deleteExpense(id),
        },
      ],
    );
  };

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
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ paddingHorizontal: 32, width: "100%" }}
      />

      <Link href="/">
        <Text style={{ color: "blue", marginTop: 16 }}>Back to home</Text>
      </Link>
    </View>
  );
}
