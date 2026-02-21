import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import type Expense from "@/src/types/Expense";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const ExpenseSummary = memo<ExpenseSummaryProps>(function ExpenseSummary({
  expenses,
}) {
  const total = useMemo(
    () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses],
  );
  const count = expenses.length;

  const accessibilityLabel = useMemo(
    () => `Summary: ${count} expenses, total ${total.toFixed(2)} euros`,
    [count, total],
  );

  return (
    <View
      style={styles.container}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
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
});

ExpenseSummary.displayName = "ExpenseSummary";

export default ExpenseSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
