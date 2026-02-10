import { StyleSheet, View, Text } from "react-native";
import { Link } from "expo-router";
import WelcomeMessage from "@/src/components/WelcomeMessage";


export default function Index() {
  return (
    <View
    style={styles.container}
    >
      <WelcomeMessage title="Welcome to the app" subtitle="This is the welcome message" />
      <Link href="/expenses">
      <Text style={{ color: "blue", marginTop: 16 }}>Go to expenses</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24, // Added padding for visual experimentation
    backgroundColor: "#f3f4f6", // Added a light background color to experiment visually
  },
});

// style={{
//   flex: 1,
//   justifyContent: "center",
//   alignItems: "center",
// }}