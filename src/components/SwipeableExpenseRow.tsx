import React, { memo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ExpenseItem from "@/src/components/ExpenseItem";
import type Expense from "@/src/types/Expense";
import { triggerLightImpact } from "@/src/utils/haptics";

const SWIPE_ACTIONS_WIDTH = 144;

interface SwipeableExpenseRowProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onSwipeableOpen: (
    direction: "left" | "right",
    swipeable: InstanceType<typeof Swipeable>,
  ) => void;
  isPendingSync?: boolean;
}

const SwipeableExpenseRow = memo<SwipeableExpenseRowProps>(
  function SwipeableExpenseRow({
    expense,
    onDelete,
    onSwipeableOpen,
    isPendingSync = false,
  }) {
    const router = useRouter();

    const handleEdit = useCallback(
      (swipeable: InstanceType<typeof Swipeable>) => {
        triggerLightImpact();
        swipeable.close();
        router.push({
          pathname: "/edit-expense",
          params: { id: expense.id },
        });
      },
      [expense.id, router],
    );

    const handleDelete = useCallback(
      (swipeable: InstanceType<typeof Swipeable>) => {
        triggerLightImpact();
        swipeable.close();
        onDelete(expense.id);
      },
      [expense.id, onDelete],
    );

    const renderRightActions = useCallback(
      (
        _progress: unknown,
        _dragX: unknown,
        swipeable: InstanceType<typeof Swipeable>,
      ) => (
        <View style={styles.actionsContainer}>
          <RectButton
            style={[styles.actionButton, styles.actionEdit]}
            onPress={() => handleEdit(swipeable)}
            accessibilityLabel="Edit expense"
            accessibilityRole="button"
          >
            <Ionicons name="pencil" size={20} color="#ffffff" />
            <Text style={styles.actionLabel}>Edit</Text>
          </RectButton>
          <RectButton
            style={[styles.actionButton, styles.actionDelete]}
            onPress={() => handleDelete(swipeable)}
            accessibilityLabel="Delete expense"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
            <Text style={styles.actionLabel}>Delete</Text>
          </RectButton>
        </View>
      ),
      [handleEdit, handleDelete],
    );

    return (
      <Swipeable
        onSwipeableOpen={onSwipeableOpen}
        renderRightActions={renderRightActions}
      >
        <ExpenseItem
          expense={expense}
          onDelete={onDelete}
          isPendingSync={isPendingSync}
        />
      </Swipeable>
    );
  },
);

SwipeableExpenseRow.displayName = "SwipeableExpenseRow";

export default SwipeableExpenseRow;

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    width: SWIPE_ACTIONS_WIDTH,
    alignSelf: "stretch",
    marginBottom: 12,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    overflow: "hidden",
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    minHeight: 72,
  },
  actionEdit: {
    backgroundColor: "#2563eb",
  },
  actionDelete: {
    backgroundColor: "#dc2626",
  },
  actionLabel: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
