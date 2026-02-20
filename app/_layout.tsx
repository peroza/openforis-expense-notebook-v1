import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ExpensesProvider } from "@/src/context/ExpensesContext";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { PostsProvider } from "@/src/context/PostsContext";
import { FirestorePostsRepository } from "@/src/services/firestorePostsRepository";

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasNavigatedRef = React.useRef(false);
  const lastSegmentRef = React.useRef<string | undefined>(undefined);

  // Derive primitive booleans so the effect only re-runs on meaningful transitions
  const isAuthenticated = !!user;
  const currentSegment = segments[0] as string | undefined;
  const inTabsGroup = currentSegment === "(tabs)";

  useEffect(() => {
    if (isLoading) return;

    if (currentSegment !== lastSegmentRef.current) {
      hasNavigatedRef.current = false;
      lastSegmentRef.current = currentSegment;
    }

    if (hasNavigatedRef.current) return;

    if (!isAuthenticated) {
      if (currentSegment !== "login") {
        hasNavigatedRef.current = true;
        router.replace("/login");
      }
    } else if (!inTabsGroup) {
      // Only redirect to expenses when we're on an "entry" route (e.g. initial load).
      // Do not redirect when user is on allowed stack screens (add-expense, edit-expense).
      const allowedOutsideTabs = ["add-expense", "edit-expense"];
      if (!allowedOutsideTabs.includes(currentSegment ?? "")) {
        hasNavigatedRef.current = true;
        router.replace("/(tabs)/expenses");
      }
    }
  }, [isAuthenticated, isLoading, currentSegment, inTabsGroup, router]);

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

  // Initialize posts repository
  const postsRepository = React.useMemo(
    () => new FirestorePostsRepository(),
    [],
  );

  return (
    <ExpensesProvider>
      <PostsProvider repository={postsRepository}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </PostsProvider>
    </ExpensesProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
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
