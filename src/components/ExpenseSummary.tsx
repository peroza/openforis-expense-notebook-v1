import { View, Text, StyleSheet } from "react-native";
import type Expense from "@/src/types/Expense";

type ExpenseSummaryProps = {
  expenses: Expense[];
};

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const count = expenses.length;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Total Expenses:</Text>
        <Text style={styles.amount}>{total.toFixed(2)} €</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Count:</Text>
        <Text style={styles.count}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 32,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#6b7280",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
