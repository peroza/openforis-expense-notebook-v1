import { View, Text, TextInput, Button } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";

export default function AddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newExpense = {
      id: Date.now().toString(), // Simple ID generation
      title: title.trim(),
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    };

    console.log("New expense:", newExpense);
    alert("Expense saved! (Check console)");

    // Clear form
    setTitle("");
    setAmount("");
  };

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
        Add New Expense
      </Text>

      <Text style={{ alignSelf: "flex-start", marginBottom: 8 }}>Title:</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          width: "100%",
          borderRadius: 8,
          marginBottom: 16,
        }}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter expense title"
      />
      <Text style={{ alignSelf: "flex-start", marginBottom: 8 }}>Amount:</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          width: "100%",
          borderRadius: 8,
          marginBottom: 16,
        }}
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        keyboardType="numeric"
      />
      <Button title="Save Expense" onPress={handleSave} />
      <Link href="/expenses">
        <Text style={{ color: "blue", marginTop: 24 }}>Back to expenses</Text>
      </Link>
    </View>
  );
}
