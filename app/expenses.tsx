import { View, Text } from "react-native";
import { Link } from "expo-router";
import WelcomeMessage from "@/src/components/WelcomeMessage";

export default function ExpensesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <WelcomeMessage
        title="Expenses"
        subtitle="This will show your expenses list"
      />
      <Button
        title="Add mock expense"
        onPress={() => {
          const newExpense: Expense = {
            id: String(expenses.length + 1),
            title: `Mock expense ${expenses.length + 1}`,
            amount: 50,
            date: "2026-01-10",
          };
          setExpenses([...expenses, newExpense]);
        }}
      />
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
