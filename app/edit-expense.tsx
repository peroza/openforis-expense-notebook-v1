import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  ScrollView as ScrollViewComponent,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import { useExpenses } from "@/src/context/ExpensesContext";
import { EXPENSE_CATEGORIES } from "@/src/constants/categories";

export default function EditExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const expenseId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { getExpenseById, updateExpense } = useExpenses();

  const expenseData = useMemo(
    () => (expenseId ? getExpenseById(expenseId) : undefined),
    [expenseId, getExpenseById],
  );

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [note, setNote] = useState("");

  // Populate form fields when expenseData is loaded
  useEffect(() => {
    if (!expenseData) return;
    setTitle(expenseData.title);
    setAmount(expenseData.amount.toString());
    setDate(new Date(expenseData.date));
    setCategory(expenseData.category || "");
    setNote(expenseData.note || "");
  }, [expenseData]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!expenseData) {
      alert("Expense not found");
      return;
    }

    await updateExpense({
      ...expenseData,
      title: title.trim(),
      amount: Number(amount),
      date: formatDate(date),
      category: category || undefined,
      note: note.trim() || undefined,
    });

    router.back();
  };

  // Show loading/error state if expense not found
  if (!expenseData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Edit Expense</Text>
        <Text style={{ marginBottom: 16, color: "#ef4444" }}>
          Expense not found.
        </Text>
        <Link href="/expenses">
          <Text style={{ color: "blue", marginTop: 16 }}>Back to expenses</Text>
        </Link>
      </View>
    );
  }

  return (
    <ScrollViewComponent style={styles.container}>
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

      {/* Category picker */}
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
    </ScrollViewComponent>
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
