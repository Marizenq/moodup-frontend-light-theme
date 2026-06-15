import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }) as any,
});

const mensagens = [
  "Respire um pouco. Você não precisa resolver tudo agora.",
  "Você está fazendo o melhor que consegue 💙",
  "Pequenos passos também são progresso 🌱",
  "Seu sentimento importa e merece atenção.",
  "Tente descansar um pouco hoje 🌙",
  "Nem todo dia precisa ser produtivo.",
];

export default function Notificacoes() {
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
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
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      alert("Permissão de notificação negada.");
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const agora = Date.now();

    // Lembrete de humor
    if (lembreteHumor) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MoodUp 💙",
          body: "Como você está se sentindo hoje?",
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(agora + 5000),
        } as any,
      });
    }

    // Resumo semanal
    if (resumoSemanal) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MoodUp 📊",
          body: "Veja como foi sua semana emocional no MoodUp.",
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(agora + 10000),
        } as any,
      });
    }

    // Mensagens de apoio
    if (mensagensApoio) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "MoodUp 🌿",
          body: mensagens[Math.floor(Math.random() * mensagens.length)],
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(agora + 15000),
        } as any,
      });
    }

    await AsyncStorage.setItem("notif_lembrete_humor", String(lembreteHumor));

    await AsyncStorage.setItem("notif_resumo_semanal", String(resumoSemanal));

    await AsyncStorage.setItem("notif_mensagens_apoio", String(mensagensApoio));

    alert("Notificações atualizadas 💜");
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
<Text style={[styles.title, { color: text }]}>
  Notificações
</Text>
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
    </View>
  );
}

function NotificationItem({ icon, title, description, value, onChange }: any) {
  const background = useThemeColor({}, "background");
  return (
   <View
  style={[
    styles.card,
    background === "#020817"
      ? {}
      : {
          backgroundColor: "#cee7f2",
          borderColor: "#7BC3E4",
        }
  ]}
>
      <View style={styles.left}>
        <Ionicons name={icon} size={24} color="#2dd4bf" />

        <View style={styles.textBox}>
         <Text
  style={[
    styles.cardTitle,
    background === "#020817"
      ? {}
      : { color: "#1E293B" },
  ]}
>
  {title}
</Text>

<Text
  style={[
    styles.cardDescription,
    background === "#020817"
      ? {}
      : { color: "#475569" },
  ]}
>
  {description}
</Text>        </View>
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
});
