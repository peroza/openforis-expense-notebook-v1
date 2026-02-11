import { Text, View, StyleSheet, Pressable } from "react-native";
import type Expense from "@/src/types/Expense";
import { useRouter } from "expo-router";

type ExpenseItemProps = {
  expense: Expense;
  onDelete: (id: string) => void;
};

export default function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/edit-expense",
      params: {
        expense: JSON.stringify(expense), // Pass as JSON string
      },
    });
  };

  return (
    <Pressable onPress={handlePress} onLongPress={() => onDelete(expense.id)}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.amount}>{expense.amount} €</Text>
        </View>
        <Text style={styles.date}>{expense.date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#ef4444",
    borderRadius: 4,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
