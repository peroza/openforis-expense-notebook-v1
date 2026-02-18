import { StyleSheet, View, Text } from "react-native";
import { Link } from "expo-router";
import WelcomeMessage from "@/src/components/WelcomeMessage";

export default function Index() {
  return (
    <View style={styles.container}>
      <WelcomeMessage
        title="Welcome to the Expense Notebook"
        subtitle="This is a project from the OpenForis team"
        imageSource={require("@/assets/images/expense-notebook-text-logo.jpg")}
      />
      <Link href="/expenses" style={styles.expensesLink}>
        <View style={styles.expensesButton}>
          <Text style={styles.expensesButtonText}>View Expenses →</Text>
        </View>
      </Link>
      <Link href="/debug" style={styles.expensesLink}>
        <View style={styles.expensesButton}>
          <Text style={styles.expensesButton}>Debug →</Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24, // Added padding for visual experimentation
    backgroundColor: "#f3f4f6", // Added a light background color to experiment visually
  },
  expensesLink: {
    width: "100%",
    marginTop: 24,
  },
  expensesButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expensesButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    padding: 10,
  },
});
