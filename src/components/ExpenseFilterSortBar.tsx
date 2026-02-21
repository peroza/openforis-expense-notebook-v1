import React, { memo, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  EXPENSE_CATEGORIES,
  getCategoryChipColors,
} from "@/src/constants/categories";
import { triggerLightImpact } from "@/src/utils/haptics";

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "title-asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Date (newest)" },
  { value: "date-asc", label: "Date (oldest)" },
  { value: "amount-desc", label: "Amount (high)" },
  { value: "amount-asc", label: "Amount (low)" },
  { value: "title-asc", label: "Title (A–Z)" },
];

interface ExpenseFilterSortBarProps {
  filterCategory: string | null;
  onFilterChange: (category: string | null) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const ExpenseFilterSortBar = memo<ExpenseFilterSortBarProps>(
  function ExpenseFilterSortBar({
    filterCategory,
    onFilterChange,
    sortOption,
    onSortChange,
  }) {
    const [showSortModal, setShowSortModal] = useState(false);

    const handleFilterPress = useCallback(
      (category: string | null) => {
        triggerLightImpact();
        onFilterChange(category);
      },
      [onFilterChange],
    );

    const handleSortButtonPress = useCallback(() => {
      triggerLightImpact();
      setShowSortModal(true);
    }, []);

    const handleSortOptionPress = useCallback(
      (option: SortOption) => {
        triggerLightImpact();
        onSortChange(option);
        setShowSortModal(false);
      },
      [onSortChange],
    );

    const sortLabel = useMemo(
      () =>
        SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "Date (newest)",
      [sortOption],
    );

    return (
      <>
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
        >
          <Pressable
            style={[
              styles.filterChip,
              filterCategory === null && styles.filterChipSelectedAll,
            ]}
            onPress={() => handleFilterPress(null)}
            accessibilityLabel="Show all categories"
            accessibilityRole="button"
            accessibilityState={{ selected: filterCategory === null }}
          >
            <Text
              style={[
                styles.filterChipText,
                filterCategory === null && styles.filterChipTextSelectedAll,
              ]}
            >
              All
            </Text>
          </Pressable>
          {EXPENSE_CATEGORIES.map((category) => {
            const isSelected = filterCategory === category;
            const colors = getCategoryChipColors(category);
            return (
              <Pressable
                key={category}
                style={[
                  styles.filterChip,
                  isSelected && { backgroundColor: colors.bg },
                ]}
                onPress={() => handleFilterPress(category)}
                accessibilityLabel={`Filter by ${category}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected
                      ? { color: colors.text }
                      : styles.filterChipTextUnselected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          style={styles.sortButton}
          onPress={handleSortButtonPress}
          accessibilityLabel={`Sort: ${sortLabel}. Tap to change sort order.`}
          accessibilityRole="button"
        >
          <Ionicons name="swap-vertical" size={18} color="#2563eb" />
          <Text style={styles.sortButtonText}>{sortLabel}</Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </Pressable>
      </View>

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.sortModalBackdrop}
          onPress={() => setShowSortModal(false)}
          accessibilityLabel="Close sort options"
        >
          <Pressable
            style={styles.sortModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort by</Text>
              <Pressable
                onPress={() => setShowSortModal(false)}
                style={styles.sortModalClose}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>
            {SORT_OPTIONS.map(({ value, label }) => (
              <Pressable
                key={value}
                style={[
                  styles.sortOptionRow,
                  sortOption === value && styles.sortOptionRowSelected,
                ]}
                onPress={() => handleSortOptionPress(value)}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: sortOption === value }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === value && styles.sortOptionTextSelected,
                  ]}
                >
                  {label}
                </Text>
                {sortOption === value && (
                  <Ionicons name="checkmark" size={22} color="#2563eb" />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      </>
    );
  },
);

ExpenseFilterSortBar.displayName = "ExpenseFilterSortBar";

export default ExpenseFilterSortBar;

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterChipsContent: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  filterChipSelectedAll: {
    backgroundColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filterChipTextSelectedAll: {
    color: "#ffffff",
  },
  filterChipTextUnselected: {
    color: "#6b7280",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sortButtonText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  sortModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sortModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 320,
  },
  sortModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sortModalClose: {
    padding: 4,
  },
  sortOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sortOptionRowSelected: {
    backgroundColor: "#eff6ff",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  sortOptionTextSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
