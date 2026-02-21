import React, { memo, useCallback, useMemo } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type Expense from "@/src/types/Expense";

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  isPendingSync?: boolean;
}

const ExpenseItem = memo<ExpenseItemProps>(function ExpenseItem({
  expense,
  onDelete,
  isPendingSync = false,
}) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/edit-expense",
      params: { id: expense.id },
    });
  }, [router, expense.id]);

  const handleLongPress = useCallback(() => {
    onDelete(expense.id);
  }, [onDelete, expense.id]);

  const accessibilityLabel = useMemo(
    () =>
      `${expense.title}, ${expense.amount} euros${isPendingSync ? ", pending sync with server" : ""}`,
    [expense.title, expense.amount, isPendingSync],
  );

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Tap to edit, long press to delete"
    >
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Text style={styles.title}>{expense.title}</Text>
            {expense.category && (
              <Text style={styles.category}>{expense.category}</Text>
            )}
          </View>
          <Text style={styles.amount}>{expense.amount} €</Text>
        </View>
        {expense.note && (
          <Text style={styles.note} numberOfLines={2}>
            {expense.note}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.date}>{expense.date}</Text>
          {isPendingSync && (
            <View style={styles.pendingBadge}>
              <Ionicons
                name="cloud-upload-outline"
                size={14}
                color="#d97706"
                style={styles.pendingIcon}
              />
              <Text style={styles.pendingText}>Pending sync</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

ExpenseItem.displayName = "ExpenseItem";

export default ExpenseItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  category: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  note: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingIcon: {
    marginRight: 4,
  },
  pendingText: {
    fontSize: 11,
    color: "#d97706",
    fontWeight: "500",
  },
});
