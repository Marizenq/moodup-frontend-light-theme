import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Conta() {
  const router = useRouter();
  const [email, setEmail] = useState("Não informado");

  useEffect(() => {
    async function carregarEmail() {
      const userSalvo = await AsyncStorage.getItem("user");

      if (userSalvo) {
        const user = JSON.parse(userSalvo);
        setEmail(user.email || "Não informado");
      }
    }

    carregarEmail();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conta</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={24} color="#2dd4bf" />
          <View>
            <Text style={styles.label}>E-mail cadastrado</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(auth)/esqueci-senha" as any)}
      >
        <Ionicons name="key-outline" size={22} color="#08101A" />
        <Text style={styles.buttonText}>Mudar senha</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    padding: 20,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#2dd4bf",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#08101A",
    fontSize: 16,
    fontWeight: "900",
  },
});