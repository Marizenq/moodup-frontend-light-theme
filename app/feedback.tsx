import { api } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const EMOJIS = ["😢", "🙁", "😐", "🙂", "😍"];

export default function Feedback() {
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [jaEnviou, setJaEnviou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function check() {
      const saved = await AsyncStorage.getItem("feedback_enviado");
      if (saved === "true") setJaEnviou(true);
    }

    check();
  }, []);

  async function enviar() {
    if (selected === null) {
      alert("Escolha uma opção antes de enviar.");
      return;
    }

    if (!text.trim()) {
      alert("Digite seu feedback antes de enviar.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/feedback", {
        message: text.trim(),
        rating: selected + 1,
      });

      console.log("Feedback enviado:", res.data);

      await AsyncStorage.setItem("feedback_enviado", "true");

      setJaEnviou(true);
      setText("");
      setSelected(null);
      setShowSuccess(true);
    } catch (err: any) {
      console.log("Erro ao enviar feedback:", err.response?.data || err);
      alert("Erro ao enviar feedback.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {jaEnviou
          ? "Quer atualizar sua avaliação? 😊"
          : "Como foi sua experiência?"}
      </Text>

      <Text style={styles.subtitle}>
        Escolha uma carinha e conte sua opinião sobre o MoodUp.
      </Text>

      <View style={styles.emojiRow}>
        {EMOJIS.map((emoji, index) => {
          const active = selected === index;

          return (
            <Pressable
              key={index}
              onPress={() => setSelected(index)}
              style={[styles.emojiBox, active && styles.active]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        placeholder="Conte um pouco da sua experiência..."
        placeholderTextColor="#6B7280"
        style={styles.input}
        multiline
        maxLength={200}
        value={text}
        onChangeText={setText}
      />

      <Text style={styles.counter}>{text.length}/200</Text>

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={enviar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "ENVIANDO..." : "Enviar feedback"}
        </Text>
      </Pressable>

      <Text style={styles.infoText}>
  Para problemas técnicos ou sugestões de melhoria, entre em contato pelo e-mail:
  {"\n"}
  <Text style={styles.email}>aplicativo.moodup@gmail.com</Text>
</Text>

      <Modal transparent animationType="fade" visible={showSuccess}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>💙</Text>
            <Text style={styles.modalTitle}>Obrigado pelo seu feedback!</Text>
            <Text style={styles.modalText}>
              Sua opinião ajuda a melhorar o MoodUp :)
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 20,
  },

  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  emojiBox: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  active: {
    borderColor: "#2dd4bf",
    borderWidth: 2,
  },

  emoji: {
    fontSize: 30,
  },

  input: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 14,
    color: "#E5E7EB",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  counter: {
    color: "#6B7280",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#2dd4bf",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#08101A",
    fontWeight: "900",
    fontSize: 16,
  },

  infoText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  modalEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },

  modalTitle: {
    color: "#E5E7EB",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  modalText: {
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
  },

  modalButton: {
    backgroundColor: "#2dd4bf",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },

  modalButtonText: {
    color: "#08101A",
    fontWeight: "900",
  },
email: {
  color: "#2dd4bf",
  fontWeight: "700",
},

});