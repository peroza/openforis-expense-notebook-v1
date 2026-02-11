import {
  View,
  Text,
  TextInput,
  Button,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { setPendingExpense } from "@/src/utils/expenseStorage";
import { EXPENSE_CATEGORIES } from "@/src/constants/categories";

export default function AddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [note, setNote] = useState("");

  const router = useRouter();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

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

    setPendingExpense(newExpense);
    router.back();
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

      <Text style={styles.label}>Note (optional):</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        value={note}
        onChangeText={setNote}
        placeholder="Add a note..."
        multiline
        numberOfLines={3}
      />

      <Button title="Save Expense" onPress={handleSave} />
      <Link href="/expenses">
        <Text style={{ color: "blue", marginTop: 24 }}>Back to expenses</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: "flex-start",
    marginBottom: 8,
    fontSize: 16,
  },
  dateDisplay: {
    fontSize: 16,
    color: "#2563eb",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  categoryOptionSelected: {
    backgroundColor: "#e3f2fd",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#333",
  },
  categoryOptionTextSelected: {
    color: "#1976d2",
    fontWeight: "600",
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
