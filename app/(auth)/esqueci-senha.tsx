import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { api } from "../../src/services/api";
import { useRouter } from "expo-router";

export default function EsqueciSenha() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  async function enviarEmail() {
    setErro("");
    setMsg("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });

      setMsg("Código enviado para seu email 📩");
      setStep("code");
      setTimer(60);
    } catch (e: any) {
      setErro(e?.response?.data?.message || "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  async function redefinirSenha() {
    setErro("");
    setMsg("");

    // Validações básicas
    if (!password || !confirm) {
      setErro("Preencha todos os campos");
      return;
    }

    if (password !== confirm) {
      setErro("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email,
        otp,
        password,
        password_confirmation: confirm,
      });

      setMsg("Senha redefinida com sucesso 🎉");
      
      // Aguarda 2 segundos e volta para o login
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
      
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message;
      
      // Verifica se é o erro de senha igual à anterior
      if (errorMessage && errorMessage.includes("não pode ser igual à senha atual")) {
        setErro("❌ Você não pode usar a mesma senha. Escolha uma senha diferente da anterior.");
      } else {
        setErro(errorMessage || "Erro ao redefinir");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>MoodUp 💙</Text>

        {step === "email" && (
          <>
            <Text style={s.subtitle}>
              Digite seu email para receber o código
            </Text>

            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Pressable style={s.button} onPress={enviarEmail} disabled={loading}>
              <Text style={s.buttonText}>
                {loading ? "Enviando..." : "Enviar código"}
              </Text>
            </Pressable>
          </>
        )}

        {step === "code" && (
          <>
            <Text style={s.subtitle}>
              Digite o código enviado para {email}
            </Text>

            <TextInput
              style={s.input}
              placeholder="Código de 6 dígitos"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />

            <TextInput
              style={s.input}
              placeholder="Nova senha (mínimo 6 caracteres)"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              style={s.input}
              placeholder="Confirmar nova senha"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />

            <Pressable 
              style={[s.button, loading && s.buttonDisabled]} 
              onPress={redefinirSenha}
              disabled={loading}
            >
              <Text style={s.buttonText}>
                {loading ? "Salvando..." : "Redefinir senha"}
              </Text>
            </Pressable>

            <Text style={s.timer}>
              {timer > 0
                ? `Reenviar código em ${timer}s`
                : "Código expirado? Solicite um novo"}
            </Text>

            {timer === 0 && (
              <Pressable onPress={enviarEmail} disabled={loading}>
                <Text style={s.resend}>Reenviar código</Text>
              </Pressable>
            )}
          </>
        )}

        {erro ? <Text style={s.error}>{erro}</Text> : null}
        {msg ? <Text style={s.success}>{msg}</Text> : null}

        <Pressable onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backText}>Voltar para o login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060912",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2dd4bf",
    marginBottom: 10,
  },

  subtitle: {
    color: "#94A3B8",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    color: "#E2E8F0",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  button: {
    backgroundColor: "#2dd4bf",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#02120F",
    fontWeight: "800",
  },

  timer: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 10,
  },

  resend: {
    color: "#2dd4bf",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "600",
  },

  error: {
    color: "#F87171",
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
  },

  success: {
    color: "#2dd4bf",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },

  backButton: {
    marginTop: 20,
    alignItems: "center",
  },

  backText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});