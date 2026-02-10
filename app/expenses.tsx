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
      <Text style={{ marginTop: 24, fontSize: 16, color: "gray" }}>
        No expenses yet (this is just a placeholder)
      </Text>
      <Link href="/">
        <Text style={{ color: "blue", marginTop: 16 }}>Back to home</Text>
      </Link>
    </View>
  );
}
