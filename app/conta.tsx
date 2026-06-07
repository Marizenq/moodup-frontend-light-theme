import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Conta() {
  const router = useRouter();

  const background = useThemeColor({}, "background");
  const card = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const border = useThemeColor({}, "border");
  const danger = useThemeColor({}, "danger");
  const primary = useThemeColor({}, "primary");

  const styles = createStyles(
    background,
    card,
    text,
    textSecondary,
    border,
    primary,
    danger,
  );

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
          <Ionicons name="mail-outline" size={24} color={primary} />
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

      <Pressable
        style={styles.dangerButton}
        onPress={() => router.push("/desativar-conta")}
      >
        <Ionicons name="person-remove-outline" size={22} color="#EF4444" />
        <Text style={styles.dangerButtonText}>Desativar conta</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (
  background: string,
  cardBackground: string,
  text: string,
  textSecondary: string,
  border: string,
  primary: string,
  danger: string,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
      padding: 20,
    },

    title: {
      color: text,
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 20,
    },

    card: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: border,
      marginBottom: 20,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    label: {
      color: textSecondary,
      fontSize: 13,
      marginBottom: 4,
    },

    value: {
      color: text,
      fontSize: 16,
      fontWeight: "700",
    },

    button: {
      backgroundColor: primary,
      borderRadius: 14,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 14,
    },

    buttonText: {
      color: "#08101A",
      fontSize: 16,
      fontWeight: "900",
    },

    dangerButton: {
      backgroundColor: cardBackground,
      borderRadius: 14,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: danger,
    },

    dangerButtonText: {
      color: danger,
      fontSize: 16,
      fontWeight: "900",
    },
  });
