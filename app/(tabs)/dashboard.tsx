import MoodCalendar from "@/components/MoodCalendar";
import EditMoodModal from "@/components/EditMoodModal";
import { moodApi, api } from "@/services/api";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  useWindowDimensions,
} from "react-native";

import { LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function Dashboard() {
  const { width } = useWindowDimensions();

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const isLight = background === "#EEF2F7";

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<any>(null);

  async function loadData() {
    try {
      const historyResponse = await moodApi.getAll();
      console.log(historyResponse.data);
      console.log(historyResponse.data.data?.length);

      let historyData = [];
      if (
        historyResponse.data?.data &&
        Array.isArray(historyResponse.data.data)
      ) {
        historyData = historyResponse.data.data;
      } else if (Array.isArray(historyResponse.data)) {
        historyData = historyResponse.data;
      } else {
        historyData = [];
      }

      setHistory(historyData);
    } catch (error: any) {
      console.log("❌ ERRO DASH:", error?.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    }
  }

  const checkAdminStatus = async () => {
    try {
      const response = await api.get("/me");
      setIsAdmin(response.data?.user?.role === "admin");
    } catch (error: any) {
      console.error(
        "❌ Erro ao verificar admin:",
        error?.response?.data || error.message,
      );
      setIsAdmin(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // 🔥 CARREGAMENTO PARALELO - mais rápido!
      const loadAll = async () => {
        setLoading(true);
        await Promise.all([loadData(), checkAdminStatus()]);
        setLoading(false);
      };
      loadAll();
    }, []),
  );

  // 🔎 filtro por período
  const filteredHistory = useMemo(() => {
    const now = new Date();

    return history.filter((item) => {
      const date = new Date(item.date);
      const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (period === "7d") return diff <= 7;
      if (period === "30d") return diff <= 30;
      return true;
    });
  }, [history, period]);

  const streak = useMemo(() => {
    if (!history.length) return 0;

    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streakCount = 1;

    for (let i = 1; i < sorted.length; i++) {
      const current = new Date(sorted[i - 1].date);
      const previous = new Date(sorted[i].date);

      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const diff =
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        streakCount++;
      } else {
        break;
      }
    }

    return streakCount;
  }, [history]);

  // 📊 estatísticas para o gráfico
  const moodStats = useMemo(() => {
    let good = 0;
    let neutral = 0;
    let bad = 0;

    filteredHistory.forEach((m) => {
      if (m.level >= 4) good++;
      else if (m.level === 3) neutral++;
      else bad++;
    });

    return { good, neutral, bad };
  }, [filteredHistory]);

  const lineData = useMemo(() => {
    let chartHistory = [...filteredHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    if (period === "30d") {
      chartHistory = chartHistory.slice(-30);
    }

    // "all" continua mostrando tudo

    return {
      labels:
        period === "7d"
          ? chartHistory.map((item) => new Date(item.date).getDate().toString())
          : chartHistory.map(() => ""),

      datasets: [
        {
          data:
            chartHistory.length > 0
              ? chartHistory.map((item) => item.level)
              : [0],
        },
      ],
    };
  }, [filteredHistory, period]);

  // 💬 mensagem inteligente
  const feedbackMessage = useMemo(() => {
    if (moodStats.good > moodStats.bad)
      return "🎉 Você teve mais dias bons essa semana!";
    if (moodStats.bad > moodStats.good)
      return "💙 Semana mais difícil, cuide-se.";
    return "⚖️ Sua semana foi equilibrada.";
  }, [moodStats]);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await moodApi.delete(id);
              await loadData();
              Alert.alert("Sucesso", "Registro excluído com sucesso!");
            } catch (error: any) {
              console.error("Erro ao deletar:", error);
              Alert.alert("Erro", "Não foi possível excluir o registro");
            }
          },
        },
      ],
    );
  };

  const handleEdit = (mood: any) => {
    setSelectedMood(mood);
    setEditModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  console.log("history.length =", history.length);
  console.log("filteredHistory.length =", filteredHistory.length);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isLight && { backgroundColor: "#EEF2F7" }]}
    >
      <Text style={[styles.title, isLight && { color: "#0F172A" }]}>
        Dashboard emocional
      </Text>

      {/* 🔘 filtro */}
      <View style={styles.filterRow}>
        {["7d", "30d", "all"].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p as any)}
            style={[styles.filterButton, period === p && styles.filterActive]}
          >
            <Text style={[styles.filterText, isLight && { color: "#475569" }]}>
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "Todos"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 métricas - apenas Registros e Streak */}
      <View style={styles.row}>
        <Animated.View entering={FadeInUp}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{filteredHistory.length}</Text>
            <Text style={styles.metricLabel}>Registros</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{streak}</Text>
            <Text style={styles.metricLabel}>Streak 🔥</Text>
          </View>
        </Animated.View>
      </View>

      <Text style={[styles.feedback, isLight && { color: "#64748B" }]}>
        {feedbackMessage}
      </Text>
      {/* 📊 gráfico */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo emocional</Text>

          <LineChart
            data={lineData}
            width={Math.min(width - 56, 700)} // largura responsiva
            height={220}
            fromZero
            bezier
            withDots
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              decimalPlaces: 0,
              color: () => "#2dd4bf",
              labelColor: () => (isLight ? "#64748B" : "#94A3B8"),
              propsForBackgroundLines: {
                stroke: "rgba(255,255,255,0.08)",
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#2dd4bf",
              },
            }}
            style={{
              borderRadius: 12,
              alignSelf: "center",
            }}
          />

          <View style={{ marginTop: 12 }}>
            <Text style={[styles.text, isLight && { color: "#64748B" }]}>
              😊 Bons: {moodStats.good}
            </Text>
            <Text style={[styles.text, isLight && { color: "#64748B" }]}>
              😐 Neutros: {moodStats.neutral}
            </Text>

            <Text style={[styles.text, isLight && { color: "#64748B" }]}>
              😞 Ruins: {moodStats.bad}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* 📅 calendário */}
      <Animated.View entering={FadeInUp.delay(300)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seu mês</Text>
          <MoodCalendar data={filteredHistory} />
        </View>
      </Animated.View>

      {/* 📋 Botões de ação - três botões lado a lado */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonHistory]}
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.buttonText}>📋 Histórico</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonReports]}
          onPress={() => router.push("/relatorios")}
        >
          <Text style={styles.buttonReportsText}>📊 Relatórios</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.button, styles.buttonAdmin]}
            onPress={() => router.push("/auditoria")}
          >
            <Text style={styles.buttonAdminText}>🔒 Auditoria</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 📦 Modal de histórico */}
      <Modal visible={showHistory} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            isLight && { backgroundColor: "#122560" },
          ]}
        >
         
          <Text style={styles.title}>Histórico completo</Text>
          
          <ScrollView>
            {filteredHistory.map((item, index) => (
              <View key={item.id || index} style={styles.historyItem}>
                <View style={styles.historyContent}>
                  <Text style={styles.text}>📅 {formatDate(item.date)}</Text>
                  <Text style={styles.text}>😊 Nível: {item.level}/5</Text>
                  {item.note ? (
                    <Text style={styles.noteText}>📝 {item.note}</Text>
                  ) : null}
                  {item.triggers && item.triggers.length > 0 ? (
                    <Text style={styles.triggerText}>
                      🎯 Gatilhos:{" "}
                      {item.triggers.map((t: any) => t.name || t).join(", ")}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setShowHistory(false);
                      handleEdit(item);
                    }}
                  >
                    <Text style={styles.actionText}>✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.actionText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal de edição */}
      <EditMoodModal
        visible={editModalVisible}
        mood={selectedMood}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedMood(null);
        }}
        onSave={() => {
          loadData();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060912",
    padding: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#E2E8F0",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  filterActive: {
    backgroundColor: "rgba(45,212,191,0.25)",
  },
  filterText: {
    color: "#CBD5F5",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  metricValue: {
    color: "#2dd4bf",
    fontSize: 24,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#94A3B8",
  },
  feedback: {
    marginTop: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardTitle: {
    color: "#2dd4bf",
    fontWeight: "700",
    marginBottom: 10,
  },
  text: {
    color: "#CBD5E1",
  },
  noteText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
  triggerText: {
    color: "#2dd4bf",
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonHistory: {
    backgroundColor: "#2dd4bf",
  },
  buttonReports: {
    backgroundColor: "rgba(45,212,191,0.1)",
    borderWidth: 1,
    borderColor: "#2dd4bf",
  },
  buttonAdmin: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  buttonText: {
    color: "#02120F",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonReportsText: {
    color: "#2dd4bf",
    fontWeight: "800",
    fontSize: 14,
  },
  buttonAdminText: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#060919",
    padding: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  historyContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: "rgba(45,212,191,0.2)",
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "rgba(233,30,99,0.2)",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#a03333",
    alignItems: "center",
  },
});
