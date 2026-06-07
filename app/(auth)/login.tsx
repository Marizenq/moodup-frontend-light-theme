import { Ionicons } from "@expo/vector-icons"; // ← ícones
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../../src/services/api";

const TOKEN_KEY = "token";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ← novo

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");

    const emailClean = email.trim();
    const passClean = password.trim();

    if (!emailClean || !passClean) {
      setErro("Preencha email e senha.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: emailClean,
        password: passClean,
      });

      const token =
        res.data?.token ??
        res.data?.access_token ??
        res.data?.data?.token;

      if (!token || typeof token !== "string") {
        setErro("Login ok, mas não recebi o token da API.");
        return;
      }

      await AsyncStorage.setItem(TOKEN_KEY, token);
      

      const user = res.data?.user;

if (user) {
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      await new Promise((r) => setTimeout(r, 150));

      const saved = await AsyncStorage.getItem(TOKEN_KEY);
      console.log("TOKEN SALVO:", saved);

      const acceptedTerms = Boolean (
        res.data?.accepted_terms ??
        !!res.data?.user?.accepted_terms_at
        );

      if (acceptedTerms) {
        router.replace("/(tabs)" as any);
      } else {
        router.replace("/terms?mode=auth" as any);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Não foi possível logar.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Acesse sua conta do MoodUp</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="seuemail@exemplo.com"
          placeholderTextColor="#6B7280"
          style={styles.input}
        />

        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            style={[styles.input, styles.passwordInput]}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#94A3B8"
            />
          </Pressable>
        </View>

        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.85 },
            loading && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </Text>
        </Pressable>

        <Link href="/(auth)/esqueci-senha" style={styles.linkCenter}>
          Esqueci minha senha
        </Link>

        <Link href="/(auth)/cadastro" style={styles.linkCenter}>
          Não tenho conta → Criar conta
        </Link>

        <Text style={styles.footerText}>
          Dica: use o mesmo email/senha que você cadastrou na API.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0F172A",
    borderColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94A3B8",
    marginBottom: 18,
  },
  label: {
    color: "#CBD5E1",
    marginBottom: 6,
    marginTop: 10,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#0B1220",
    borderColor: "#243041",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#E5E7EB",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 10,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  linkCenter: {
    color: "#E5E7EB",
    opacity: 0.9,
    marginTop: 12,
    textAlign: "center",
  },
  footerText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 14,
    textAlign: "center",
  },
});