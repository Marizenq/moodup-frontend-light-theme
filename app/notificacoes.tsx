import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

export default function Notificacoes() {
  const [lembreteHumor, setLembreteHumor] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState(false);
  const [mensagensApoio, setMensagensApoio] = useState(false);

  useEffect(() => {
    async function carregarPreferencias() {
      const lembrete = await AsyncStorage.getItem("notif_lembrete_humor");
      const resumo = await AsyncStorage.getItem("notif_resumo_semanal");
      const apoio = await AsyncStorage.getItem("notif_mensagens_apoio");

      if (lembrete !== null) setLembreteHumor(lembrete === "true");
      if (resumo !== null) setResumoSemanal(resumo === "true");
      if (apoio !== null) setMensagensApoio(apoio === "true");
    }

    carregarPreferencias();
  }, []);

  async function salvarAlteracoes() {
    await AsyncStorage.setItem("notif_lembrete_humor", String(lembreteHumor));
    await AsyncStorage.setItem("notif_resumo_semanal", String(resumoSemanal));
    await AsyncStorage.setItem("notif_mensagens_apoio", String(mensagensApoio));

    alert("Preferências salvas 💜");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>

      <Text style={styles.subtitle}>
        Escolha quais lembretes deseja receber no futuro.
      </Text>

      <NotificationItem
        icon="heart-outline"
        title="Lembrete de humor"
        description="Receber lembretes para registrar como você está se sentindo."
        value={lembreteHumor}
        onChange={setLembreteHumor}
      />

      <NotificationItem
        icon="stats-chart-outline"
        title="Resumo semanal"
        description="Receber mensagens sobre sua evolução durante a semana."
        value={resumoSemanal}
        onChange={setResumoSemanal}
      />

      <NotificationItem
        icon="chatbubble-ellipses-outline"
        title="Mensagens de apoio"
        description="Receber frases acolhedoras e lembretes de autocuidado."
        value={mensagensApoio}
        onChange={setMensagensApoio}
      />

      <Pressable style={styles.button} onPress={salvarAlteracoes}>
        <Text style={styles.buttonText}>Salvar alterações</Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={22} color="#2dd4bf" />
        <Text style={styles.infoText}>
          Esta área está preparada para futura integração com notificações reais do aplicativo.
        </Text>
      </View>
    </View>
  );
}

function NotificationItem({ icon, title, description, value, onChange }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Ionicons name={icon} size={24} color="#2dd4bf" />

        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>

      <Switch value={value} onValueChange={onChange} />
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
    marginBottom: 6,
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 15,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  textBox: {
    flex: 1,
  },
  cardTitle: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "800",
  },
  cardDescription: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2dd4bf",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#08101A",
    fontSize: 16,
    fontWeight: "900",
  },
  infoBox: {
    marginTop: 16,
    backgroundColor: "rgba(45,212,191,.08)",
    borderColor: "rgba(45,212,191,.25)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    gap: 10,
  },
  infoText: {
    color: "#CBD5E1",
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});