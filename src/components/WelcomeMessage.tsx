import { StyleSheet, View, Button, Text, Image } from "react-native";

type WelcomeMessageProps = {
  title: string;
  subtitle?: string;
  imageSource?: any; // Can be require() or { uri: '...' }
};

export default function WelcomeMessage({
  title,
  subtitle,
  imageSource,
}: WelcomeMessageProps) {
  return (
    <View>
      <View style={{ alignItems: "center", marginVertical: 16 }}>
        {imageSource && (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        )}
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
  image: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
});
