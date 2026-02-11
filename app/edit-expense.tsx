import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function EditExpenseScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Edit Expense
      </Text>
      <Text style={{ color: "gray" }}>Form will go here</Text>

      <Link href="/expenses">
        <Text style={{ color: "blue", marginTop: 24 }}>Back to expenses</Text>
      </Link>
    </View>
  );
}
