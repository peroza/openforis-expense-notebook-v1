import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { setExpenseToUpdate } from "@/src/utils/expenseStorage";
import { EXPENSE_CATEGORIES } from "@/src/constants/categories";
import type Expense from "@/src/types/Expense";

export default function EditExpenseScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const expenseData = JSON.parse(params.expense as string) as Expense;

  const [title, setTitle] = useState(expenseData.title);
  const [amount, setAmount] = useState(expenseData.amount.toString());
  const [date, setDate] = useState(new Date(expenseData.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<string>(expenseData.category || "");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [note, setNote] = useState(expenseData.note || "");

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const updatedExpense: Expense = {
      ...expenseData, // Keep original id and date
      title: title.trim(),
      amount: Number(amount),
      date: formatDate(date),
      category: category || undefined,
      note: note.trim() || undefined,
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

      {/* Category picker - same as add-expense.tsx */}
      <Text style={styles.label}>Category:</Text>
      <Pressable
        onPress={() => setShowCategoryPicker(true)}
        style={styles.pickerButton}
      >
        <Text>{category || "Select category"}</Text>
      </Pressable>

      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowCategoryPicker(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.categoryList}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date picker */}
      <Text style={styles.label}>Date:</Text>
      <Pressable onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateDisplay}>{formatDate(date)}</Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Note field */}
      <Text style={styles.label}>Note (optional):</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        value={note}
        onChangeText={setNote}
        placeholder="Add a note..."
        multiline
        numberOfLines={3}
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
  dateDisplay: {
    fontSize: 16,
    color: "#2563eb",
    marginBottom: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    width: "100%",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  categoryOptionSelected: {
    backgroundColor: "#e3f2fd",
  },
  categoryOptionText: {
    fontSize: 16,
  },
  categoryOptionTextSelected: {
    color: "#1976d2",
    fontWeight: "600",
  },
});
