import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/src/config/firebase";
import { Platform } from "react-native";

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log("✅ Signed in with email:", email);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Error signing in with email:", error);
    throw error;
  }
}

/**
 * Sign in with Google
 * Uses signInWithPopup for web (works with Expo Web Browser)
 * For native, we may need to use expo-auth-session later
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  // For web, use signInWithPopup
  if (Platform.OS === "web") {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("✅ Signed in with Google");
      return userCredential.user;
    } catch (error) {
      console.error("❌ Error signing in with Google:", error);
      throw error;
    }
  }

  // For native platforms, throw an error for now
  // We'll implement native Google Sign-In later if needed
  throw new Error(
    "Google Sign-In is currently only supported on web. Native support coming soon.",
  );
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  try {
    await firebaseSignOut(auth);
    console.log("✅ Signed out successfully");
  } catch (error) {
    console.error("❌ Error signing out:", error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): User | null {
  if (!auth) {
    console.warn("⚠️ Firebase Auth is not initialized");
    return null;
  }

  return auth.currentUser;
}

/**
 * Listen to authentication state changes
 * Returns an unsubscribe function
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void,
): () => void {
  if (!auth) {
    console.warn("⚠️ Firebase Auth is not initialized");
    // Don't call callback - let the context handle the loading state
    // Return a no-op unsubscribe function
    return () => {};
  }

  return firebaseOnAuthStateChanged(auth, callback);
}
