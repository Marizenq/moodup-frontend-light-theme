import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../src/services/api";

export default function DesativarConta() {
  const router = useRouter();

  async function desativarConta() {
    try {
      await api.post("/account/deactivate");

      await AsyncStorage.multiRemove(["token", "user"]);

      Alert.alert("Conta desativada", "Sua conta foi desativada com sucesso.");

      router.replace("/(auth)/login" as any);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível desativar sua conta. Tente novamente.",
      );

      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="person-remove-outline" size={42} color="#EF4444" />

        <Text style={styles.title}>Desativar conta</Text>

        <Text style={styles.description}>
          Tem certeza que deseja desativar sua conta?
          {"\n\n"}
          Seu acesso será bloqueado temporariamente, mas você poderá reativá-la
          futuramente utilizando o mesmo e-mail através da redefinição de senha.
        </Text>

        <Pressable style={styles.confirmButton} onPress={desativarConta}>
          <Text style={styles.confirmButtonText}>Confirmar desativação</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1F2937",
    alignItems: "center",
  },
  title: {
    color: "#E5E7EB",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 16,
  },
  description: {
    color: "#CBD5E1",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  confirmButton: {
    backgroundColor: "#991B1B",
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  cancelButton: {
    width: "100%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cancelButtonText: {
    color: "#CBD5E1",
    fontSize: 16,
    fontWeight: "700",
  },
});
