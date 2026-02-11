import { Text, View } from "react-native";
import type Expense from "@/src/types/Expense";
import { Link } from "expo-router";

type ExpenseItemProps = {
  expense: Expense;
};

export default function ExpenseItem({ expense }: ExpenseItemProps) {
  return (
    <Link href="/add-expense">
      <View style={{ paddingVertical: 8 }}>
        <Text>{expense.title}</Text>
        <Text>{expense.amount} €</Text>
      </View>
    </Link>
  );
}
