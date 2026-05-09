import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Pequeno delay para garantir que o layout está pronto
    const timeoutId = setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6d5efc" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
    justifyContent: "center",
    alignItems: "center",
  },
});