import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";

const LoginScreen = memo(() => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailSignIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmail(email.trim(), password);
      // Navigation will be handled by auth guard in _layout.tsx
      router.replace("/expenses");
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Failed to sign in. Please try again.";

      if (error?.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error?.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error?.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error?.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      } else if (error?.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, signInWithEmail, router]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      // Navigation will be handled by auth guard in _layout.tsx
      router.replace("/(tabs)/expenses");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";

      if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle, router]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setError(null);
  }, []);

  const signInButtonStyle = useMemo(
    () => [styles.signInButton, isLoading && styles.buttonDisabled],
    [isLoading],
  );

  const googleButtonStyle = useMemo(
    () => [styles.googleButton, isLoading && styles.buttonDisabled],
    [isLoading],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  accessibilityLabel="Email input"
                  accessibilityRole="text"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b7280"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  accessibilityLabel="Password input"
                  accessibilityRole="text"
                />
              </View>
            </View>

            <Pressable
              onPress={handleEmailSignIn}
              style={signInButtonStyle}
              disabled={isLoading}
              accessibilityLabel="Sign in with email"
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={handleGoogleSignIn}
              style={googleButtonStyle}
              disabled={isLoading}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
            >
              <Ionicons name="logo-google" size={20} color="#4285f4" />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

LoginScreen.displayName = "LoginScreen";

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#dc2626",
    fontSize: 14,
  },
  form: {
    width: "100%",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#111827",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
