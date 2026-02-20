import React, { memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WelcomeMessage from "@/src/components/WelcomeMessage";
import ExpenseItem from "@/src/components/ExpenseItem";
import ExpenseSummary from "@/src/components/ExpenseSummary";
import { useExpenses } from "@/src/context/ExpensesContext";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

const ExpensesScreen = memo(() => {
  const { expenses, isLoading, isSyncing, deleteExpense, refresh } =
    useExpenses();
  const isOnline = useNetworkStatus();
  const router = useRouter();

  const handleDelete = useCallback(
    (id: string) => {
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
    },
    [deleteExpense],
  );

  const handleAddExpense = useCallback(() => {
    router.push("/add-expense");
  }, [router]);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof expenses)[0] }) => (
      <ExpenseItem expense={item} onDelete={handleDelete} />
    ),
    [handleDelete],
  );

  const keyExtractor = useCallback((item: (typeof expenses)[0]) => item.id, []);

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      expenses.length === 0 && styles.listContentEmpty,
    ],
    [expenses.length],
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <WelcomeMessage
          title="Expenses"
          subtitle="Manage and track your expenses"
        />
        <Pressable
          style={styles.statusIconContainer}
          accessibilityLabel={isOnline ? "Online" : "Offline"}
          accessibilityRole="imagebutton"
        >
          <Ionicons
            name={isOnline ? "wifi" : "wifi-outline"}
            size={20}
            color={isOnline ? "#10b981" : "#ef4444"}
          />
        </Pressable>
      </View>

      {isSyncing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.syncText}>Syncing with server...</Text>
        </View>
      )}

      <Pressable
        onPress={handleAddExpense}
        style={styles.addButton}
        accessibilityLabel="Add new expense"
        accessibilityRole="button"
        accessibilityHint="Opens the form to add a new expense"
      >
        <Ionicons name="add-circle" size={24} color="#ffffff" />
        <Text style={styles.addButtonText}>Add New Expense</Text>
      </Pressable>

      <ExpenseSummary expenses={expenses} />

      <FlatList
        data={expenses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the button above to add your first expense
            </Text>
          </View>
        }
      />
    </View>
  );
});

ExpensesScreen.displayName = "ExpensesScreen";

export default ExpensesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  headerContainer: {
    position: "relative",
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  statusIconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  syncText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
