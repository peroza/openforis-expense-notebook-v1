import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ExpensesProvider } from "@/src/context/ExpensesContext";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigatedRef = React.useRef(false);
  const lastSegmentRef = React.useRef<string | undefined>(undefined);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return; // Don't navigate while loading

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === "login";

    // Reset navigation flag if segment changed (navigation completed)
    if (currentSegment !== lastSegmentRef.current) {
      hasNavigatedRef.current = false;
      lastSegmentRef.current = currentSegment;
    }

    // Prevent multiple navigations in the same render cycle
    if (hasNavigatedRef.current) {
      return;
    }

    if (!user && !inAuthGroup) {
      hasNavigatedRef.current = true;
      router.replace("/login");
    } else if (user && inAuthGroup) {
      hasNavigatedRef.current = true;
      router.replace("/expenses");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return <Stack />;
  }

  return (
    <ExpensesProvider>
      <Stack />
    </ExpensesProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
});
