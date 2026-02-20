import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, memoryLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Platform } from "react-native";

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

// Initialize Firebase Authentication
export const auth = app ? getAuth(app) : null;

if (auth) {
  console.log("✅ Firebase Authentication initialized successfully");
} else {
  console.warn("⚠️ Firebase Authentication not initialized - Firebase app not available");
}