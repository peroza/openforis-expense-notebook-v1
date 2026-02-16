import { View, Text, Button } from "react-native";
import { db } from "@/src/config/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function DebugScreen() {
  const testFirestore = async () => {
    if (!db) {
      alert("❌ Firestore not initialized");
      return;
    }
    try {
      const snap = await getDocs(collection(db, "expenses"));
      alert(`✅ Firestore connected! Found ${snap.docs.length} expenses`);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Firebase Debug</Text>
      <Text style={{ marginBottom: 8 }}>
        Firestore Status: {db ? "✅ Connected" : "❌ Not Connected"}
      </Text>
      <Button title="Test Firestore Query" onPress={testFirestore} />
    </View>
  );
}
