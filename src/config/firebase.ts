import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, memoryLocalCache } from "firebase/firestore";
import { initializeAuth, getAuth } from "firebase/auth";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  if (getApps().length === 0) {
    if (!firebaseConfig.projectId) {
      console.warn("⚠️ Firebase not configured: Missing projectId");
      return null;
    }
    console.log("✅ Initializing Firebase with project:", firebaseConfig.projectId);
    return initializeApp(firebaseConfig);
  }
  return getApps()[0] as FirebaseApp;
}

export const app = getFirebaseApp();
// Use persistent cache only on web (where IndexedDB is available)
export const db = app
  ? initializeFirestore(app, {
      localCache: Platform.OS === "web" ? persistentLocalCache() : memoryLocalCache(),
    })
  : null;

if (db) {
  console.log("✅ Firestore initialized successfully");
} else {
  console.warn("⚠️ Firestore not initialized - using AsyncStorage fallback");
}

// Initialize Firebase Authentication with AsyncStorage persistence
let authInstance: ReturnType<typeof getAuth> | null = null;

if (app) {
  try {
    // For React Native, try to initialize with AsyncStorage persistence
    if (Platform.OS !== "web") {
      // Use dynamic require to access getReactNativePersistence
      const authModule = require("firebase/auth") as typeof import("firebase/auth") & {
        getReactNativePersistence?: (storage: typeof AsyncStorage) => any;
      };
      
      if (authModule.getReactNativePersistence) {
        authInstance = initializeAuth(app, {
          persistence: authModule.getReactNativePersistence(AsyncStorage),
        });
        console.log("✅ Firebase Authentication initialized with AsyncStorage persistence");
      } else {
        // Fallback: use getAuth
        authInstance = getAuth(app);
        console.warn("⚠️ getReactNativePersistence not available, using getAuth");
      }
    } else {
      // For web, use getAuth directly
      authInstance = getAuth(app);
      console.log("✅ Firebase Authentication initialized (web)");
    }
  } catch (error: any) {
    // If auth is already initialized, use getAuth
    if (error?.code === "auth/already-initialized") {
      authInstance = getAuth(app);
      console.log("✅ Firebase Authentication initialized (already initialized)");
    } else {
      console.error("❌ Error initializing Firebase Auth:", error);
      // Fallback to getAuth
      try {
        authInstance = getAuth(app);
        console.log("✅ Firebase Authentication initialized (fallback)");
      } catch (fallbackError) {
        console.error("❌ Failed to initialize Firebase Auth:", fallbackError);
      }
    }
  }
}

export const auth = authInstance;

if (!auth) {
  console.warn("⚠️ Firebase Authentication not initialized - Firebase app not available");
}