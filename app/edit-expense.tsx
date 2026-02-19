import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useExpenses } from "@/src/context/ExpensesContext";
import { EXPENSE_CATEGORIES } from "@/src/constants/categories";

const EditExpenseScreen = memo(() => {
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

  useEffect(() => {
    if (!expenseData) return;
    setTitle(expenseData.title);
    setAmount(expenseData.amount.toString());
    setDate(new Date(expenseData.date));
    setCategory(expenseData.category || "");
    setNote(expenseData.note || "");
  }, [expenseData]);

  const formatDate = useCallback((date: Date) => {
    return date.toISOString().split("T")[0];
  }, []);

  const handleDateChange = useCallback(
    (event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setDate(selectedDate);
      }
    },
    [],
  );

  const handleCategorySelect = useCallback((cat: string) => {
    setCategory(cat);
    setShowCategoryPicker(false);
  }, []);

  const handleOpenCategoryPicker = useCallback(() => {
    setShowCategoryPicker(true);
  }, []);

  const handleCloseCategoryPicker = useCallback(() => {
    setShowCategoryPicker(false);
  }, []);

  const handleOpenDatePicker = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert("Validation Error", "Please fill in title and amount fields");
      return;
    }

    if (!expenseData) {
      Alert.alert("Error", "Expense not found");
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
  }, [title, amount, date, category, note, expenseData, formatDate, updateExpense, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const formattedDate = useMemo(() => formatDate(date), [date, formatDate]);

  const categoryButtonStyle = useMemo(
    () => [
      styles.pickerButton,
      category && styles.pickerButtonSelected,
    ],
    [category],
  );

  const dateButtonStyle = useMemo(
    () => [styles.dateButton, styles.dateButtonActive],
    [],
  );

  if (!expenseId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Expense ID Missing</Text>
        <Text style={styles.errorText}>
          No expense ID provided. Please go back and select an expense to edit.
        </Text>
        <Pressable
          onPress={handleCancel}
          style={styles.errorButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!expenseData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading expense...</Text>
        <Pressable
          onPress={handleCancel}
          style={styles.cancelButton}
          accessibilityLabel="Cancel and go back"
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Expense</Text>
          <Pressable
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel and go back"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter expense title"
              placeholderTextColor="#9ca3af"
              accessibilityLabel="Expense title input"
              accessibilityRole="text"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currency}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                accessibilityLabel="Expense amount input"
                accessibilityRole="text"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              onPress={handleOpenCategoryPicker}
              style={categoryButtonStyle}
              accessibilityLabel={`Category: ${category || "Not selected"}`}
              accessibilityRole="button"
              accessibilityHint="Opens category selection modal"
            >
              <Text style={[styles.pickerText, category && styles.pickerTextSelected]}>
                {category || "Select category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Pressable>
          </View>

          <Modal
            visible={showCategoryPicker}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCloseCategoryPicker}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={handleCloseCategoryPicker}
              accessibilityLabel="Close category picker"
            >
              <Pressable
                style={styles.modalContent}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <Pressable
                    onPress={handleCloseCategoryPicker}
                    style={styles.modalCloseButton}
                    accessibilityLabel="Close"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </Pressable>
                </View>
                <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => handleCategorySelect(cat)}
                      style={[
                        styles.categoryOption,
                        category === cat && styles.categoryOptionSelected,
                      ]}
                      accessibilityLabel={`Select ${cat} category`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === cat }}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          category === cat && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                      {category === cat && (
                        <Ionicons name="checkmark" size={20} color="#1976d2" />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>

          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <Pressable
              onPress={handleOpenDatePicker}
              style={dateButtonStyle}
              accessibilityLabel={`Date: ${formattedDate}`}
              accessibilityRole="button"
              accessibilityHint="Opens date picker"
            >
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <Text style={styles.dateDisplay}>{formattedDate}</Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Expense note input"
              accessibilityRole="text"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          style={styles.saveButton}
          accessibilityLabel="Save changes"
          accessibilityRole="button"
          accessibilityHint="Saves the expense changes and returns to expenses list"
        >
          <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    </View>
  );
});

EditExpenseScreen.displayName = "EditExpenseScreen";

export default EditExpenseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  errorButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "500",
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    color: "#111827",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  pickerButtonSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  pickerText: {
    fontSize: 16,
    color: "#6b7280",
  },
  pickerTextSelected: {
    color: "#2563eb",
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dateButtonActive: {
    paddingHorizontal: 4,
  },
  dateDisplay: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    color: "#111827",
    minHeight: 100,
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
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  modalCloseButton: {
    padding: 4,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  categoryOptionSelected: {
    backgroundColor: "#eff6ff",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  categoryOptionTextSelected: {
    color: "#1976d2",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
