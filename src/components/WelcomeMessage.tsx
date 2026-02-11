import { StyleSheet, View, Button, Text } from "react-native";

type WelcomeMessageProps = {
  title: string;
  subtitle?: string;
};

export default function WelcomeMessage({
  title,
  subtitle,
}: WelcomeMessageProps) {
  return (
    <View>
      <View style={{ alignItems: "center", marginVertical: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{title}</Text>
        <Text style={{ fontSize: 16, color: "gray" }}>{subtitle ?? ""}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});
