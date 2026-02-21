import React, { memo, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";

const TOAST_DURATION_MS = 1000;

export interface SuccessToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

const SuccessToast = memo<SuccessToastProps>(function SuccessToast({
  visible,
  message,
  onDismiss,
}) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
});

SuccessToast.displayName = "SuccessToast";

export default SuccessToast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  toast: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
