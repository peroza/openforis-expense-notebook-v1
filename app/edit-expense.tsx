import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { setExpenseToUpdate } from "@/src/utils/expenseStorage";
import type Expense from "@/src/types/Expense";

export default function EditExpenseScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const expenseData = JSON.parse(params.expense as string) as Expense;

  const [title, setTitle] = useState(expenseData.title);
  const [amount, setAmount] = useState(expenseData.amount.toString());

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const updatedExpense: Expense = {
      ...expenseData, // Keep original id and date
      title: title.trim(),
      amount: Number(amount),
    };

    setExpenseToUpdate(updatedExpense);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Expense</Text>

      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter expense title"
      />

      <Text style={styles.label}>Amount:</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        keyboardType="numeric"
      />

      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    width: "100%",
    borderRadius: 8,
    marginBottom: 16,
  },
});
