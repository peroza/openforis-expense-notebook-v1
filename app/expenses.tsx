import { View, Text, FlatList, Alert, RefreshControl, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WelcomeMessage from "@/src/components/WelcomeMessage";
import ExpenseItem from "@/src/components/ExpenseItem";
import ExpenseSummary from "@/src/components/ExpenseSummary";
import { useExpenses } from "@/src/context/ExpensesContext";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

export default function ExpensesScreen() {
  const { expenses, isLoading, isSyncing, deleteExpense, refresh } =
    useExpenses();
  const isOnline = useNetworkStatus();

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
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <WelcomeMessage
          title="Expenses"
          subtitle="This will show your expenses list"
        />
        <View style={styles.statusIconContainer}>
          <Ionicons
            name={isOnline ? "wifi" : "wifi-outline"}
            size={20}
            color={isOnline ? "#10b981" : "#ef4444"}
          />
        </View>
      </View>

      {/* Sync Status Indicator */}
      {isSyncing && (
        <View
          style={{
            backgroundColor: "#dbeafe",
            padding: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#2563eb", fontSize: 12 }}>
            Syncing with server...
          </Text>
        </View>
      )}

      <Link href="/add-expense">
        <Text style={{ color: "blue", marginTop: 16, marginHorizontal: 32 }}>
          Add New Expense
        </Text>
      </Link>

      <ExpenseSummary expenses={expenses} />

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem expense={item} onDelete={handleDelete} />
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={() => void refresh()}
            tintColor="#2563eb"
            colors={["#2563eb"]}
          />
        }
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 16 }}>
              No expenses yet. Add your first expense!
            </Text>
          </View>
        }
      />

      <Link href="/">
        <Text
          style={{
            color: "blue",
            marginTop: 16,
            marginHorizontal: 32,
            marginBottom: 16,
          }}
        >
          Back to home
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
  },
  statusIconContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});
