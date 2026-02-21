import React, { memo, useCallback, useMemo, useRef, useState } from "react";
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
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WelcomeMessage from "@/src/components/WelcomeMessage";
import ExpenseSummary from "@/src/components/ExpenseSummary";
import ExpenseFilterSortBar, {
  type SortOption,
} from "@/src/components/ExpenseFilterSortBar";
import SwipeableExpenseRow from "@/src/components/SwipeableExpenseRow";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useExpenses } from "@/src/context/ExpensesContext";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { triggerLightImpact } from "@/src/utils/haptics";
import type Expense from "@/src/types/Expense";

export type { SortOption } from "@/src/components/ExpenseFilterSortBar";

const ExpensesScreen = memo(() => {
  const {
    expenses,
    isLoading,
    isSyncing,
    pendingSyncIds,
    deleteExpense,
    refresh,
  } = useExpenses();
  const isOnline = useNetworkStatus();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openSwipeableRef = useRef<InstanceType<typeof Swipeable> | null>(null);

  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  const filteredAndSortedExpenses = useMemo(() => {
    let list: Expense[] =
      filterCategory === null
        ? expenses
        : expenses.filter((e) => e.category === filterCategory);
    list = list.slice();
    switch (sortOption) {
      case "date-desc":
        list.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case "date-asc":
        list.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "amount-desc":
        list.sort((a, b) => b.amount - a.amount);
        break;
      case "amount-asc":
        list.sort((a, b) => a.amount - b.amount);
        break;
      case "title-asc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return list;
  }, [expenses, filterCategory, sortOption]);

  const handleSwipeableOpen = useCallback(
    (direction: "left" | "right", swipeable: InstanceType<typeof Swipeable>) => {
      if (
        openSwipeableRef.current &&
        openSwipeableRef.current !== swipeable
      ) {
        openSwipeableRef.current.close();
      }
      openSwipeableRef.current = swipeable;
    },
    [],
  );

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
    triggerLightImpact();
    router.push("/add-expense");
  }, [router]);

  const handleExportCsv = useCallback(() => {
    triggerLightImpact();
    // Placeholder: export expenses as CSV (to be implemented)
    Alert.alert("Export CSV", "Export to CSV will be available soon.", [
      { text: "OK" },
    ]);
  }, []);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof expenses)[0] }) => (
      <SwipeableExpenseRow
        expense={item}
        onDelete={handleDelete}
        onSwipeableOpen={handleSwipeableOpen}
        isPendingSync={pendingSyncIds.has(item.id)}
      />
    ),
    [handleDelete, handleSwipeableOpen, pendingSyncIds],
  );

  const keyExtractor = useCallback((item: (typeof expenses)[0]) => item.id, []);

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      filteredAndSortedExpenses.length === 0 && styles.listContentEmpty,
    ],
    [filteredAndSortedExpenses.length],
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color="#92400e" />
            <Text style={styles.offlineBannerText}>
              You're offline. Changes will sync when back online.
            </Text>
          </View>
        )}
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonLeft}>
                  <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
                  <View style={[styles.skeletonBlock, styles.skeletonChip]} />
                </View>
                <View style={[styles.skeletonBlock, styles.skeletonAmount]} />
              </View>
              <View style={[styles.skeletonBlock, styles.skeletonNote]} />
              <View style={styles.skeletonFooter}>
                <View style={[styles.skeletonBlock, styles.skeletonDate]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={18} color="#92400e" />
          <Text style={styles.offlineBannerText}>
            You're offline. Changes will sync when back online.
          </Text>
        </View>
      )}
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

      <ExpenseFilterSortBar
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <View style={styles.summaryWrapper}>
        <ExpenseSummary expenses={filteredAndSortedExpenses} />
      </View>

      <FlatList
        data={filteredAndSortedExpenses}
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
            <Text style={styles.emptyTitle}>
              {filterCategory === null
                ? "No expenses yet"
                : "No expenses in this category"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filterCategory === null
                ? "Tap the button below to add your first expense"
                : "Try another category or clear the filter"}
            </Text>
          </View>
        }
      />

      <View style={styles.addButtonFooter}>
        <View style={styles.footerRow}>
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
          <Pressable
            onPress={handleExportCsv}
            style={styles.exportButton}
            accessibilityLabel="Export expenses as CSV"
            accessibilityRole="button"
            accessibilityHint="Exports expense list as a CSV file"
          >
            <Ionicons name="document-text-outline" size={22} color="#374151" />
          </Pressable>
        </View>
      </View>
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
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fef3c7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#fcd34d",
  },
  offlineBannerText: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  skeletonList: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skeletonLeft: {
    flex: 1,
  },
  skeletonBlock: {
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 16,
    width: "70%",
    marginBottom: 8,
  },
  skeletonChip: {
    height: 22,
    width: 72,
    borderRadius: 12,
  },
  skeletonAmount: {
    height: 18,
    width: 56,
  },
  skeletonNote: {
    height: 14,
    width: "90%",
    marginTop: 8,
  },
  skeletonFooter: {
    flexDirection: "row",
    marginTop: 8,
  },
  skeletonDate: {
    height: 12,
    width: 48,
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
  summaryWrapper: {
    marginTop: 12,
  },
  addButtonFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
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
  exportButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
