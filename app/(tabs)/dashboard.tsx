import MoodCalendar from "@/components/MoodCalendar";
import EditMoodModal from "@/components/EditMoodModal";
import { moodApi } from "@/services/api";

import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import { BarChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useFocusEffect } from "expo-router";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [weekly, setWeekly] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");
  
  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<any>(null);

  async function loadData() {
    try {
      setLoading(true);

      console.log("🚀 Iniciando loadData...");

      const [weeklyResponse, historyResponse, insightsResponse] = await Promise.all([
        moodApi.getWeeklySummary(),
        moodApi.getAll(),
        moodApi.getWeeklyInsights(),
      ]);

      // ============================================
      // 🔥 LOGS DE DEBUG - HISTORY 🔥
      // ============================================
      console.log("========== DEBUG HISTORY RESPONSE ==========");
      console.log("1. Tipo do response:", typeof historyResponse);
      console.log("2. historyResponse.data:", historyResponse.data);
      console.log("3. JSON completo:", JSON.stringify(historyResponse.data, null, 2));
      console.log("4. É array?", Array.isArray(historyResponse.data));
      console.log("5. Tem propriedade 'data'?", historyResponse.data?.data);
      console.log("6. Tipo do data.data:", typeof historyResponse.data?.data);
      console.log("7. É array o data.data?", Array.isArray(historyResponse.data?.data));
      if (historyResponse.data?.data) {
        console.log("8. Quantidade em data.data:", historyResponse.data.data.length);
      }
      console.log("9. Todas as chaves do objeto:", Object.keys(historyResponse.data || {}));
      console.log("============================================");

      // ============================================
      // 🔥 LOGS DE DEBUG - WEEKLY 🔥
      // ============================================
      console.log("========== DEBUG WEEKLY RESPONSE ==========");
      console.log("weeklyResponse.data:", weeklyResponse.data);
      console.log("============================================");

      // ============================================
      // 🔥 LOGS DE DEBUG - INSIGHTS 🔥
      // ============================================
      console.log("========== DEBUG INSIGHTS RESPONSE ==========");
      console.log("insightsResponse.data:", insightsResponse.data);
      console.log("============================================");

      setWeekly(weeklyResponse.data || null);

      // Tentativa de extrair os dados corretamente
      let historyData = [];
      
      if (historyResponse.data?.data && Array.isArray(historyResponse.data.data)) {
        console.log("✅ CASO 1: Pegando historyResponse.data.data");
        historyData = historyResponse.data.data;
      } 
      else if (Array.isArray(historyResponse.data)) {
        console.log("✅ CASO 2: Pegando historyResponse.data (array direto)");
        historyData = historyResponse.data;
      }
      else if (historyResponse.data?.data?.data && Array.isArray(historyResponse.data.data.data)) {
        console.log("✅ CASO 3: Pegando historyResponse.data.data.data (aninhado)");
        historyData = historyResponse.data.data.data;
      }
      else {
        console.log("❌ NENHUM FORMATO RECONHECIDO!");
        console.log("📦 Conteúdo bruto recebido:", historyResponse.data);
        historyData = [];
      }
      
      console.log(`📊 TOTAL DE REGISTROS EXTRAÍDOS: ${historyData.length}`);
      
      if (historyData.length > 0) {
        console.log("📝 Primeiro registro:", JSON.stringify(historyData[0], null, 2));
      }
      
      setHistory(historyData);
      setInsights(insightsResponse.data || null);
      
    } catch (error: any) {
      console.log("❌ ERRO DASH:", error?.response?.data || error.message);
      console.log("❌ Status do erro:", error?.response?.status);
      console.log("❌ Headers:", error?.response?.headers);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
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

  // 🔥 streak
  function calculateStreak(data: any[]) {
    if (!data.length) return 0;
    
    const sorted = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i].date);
      date.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  const streak = calculateStreak(history);

  // 📊 estatísticas
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

  // 📊 gráfico de barras
  const barData = {
    labels: ["Ruim", "Neutro", "Bom"],
    datasets: [
      {
        data: [moodStats.bad, moodStats.neutral, moodStats.good],
      },
    ],
  };

  // 💬 mensagem inteligente
  const feedbackMessage = useMemo(() => {
    if (moodStats.good > moodStats.bad)
      return "🎉 Você teve mais dias bons essa semana!";
    if (moodStats.bad > moodStats.good)
      return "💙 Semana mais difícil, cuide-se.";
    return "⚖️ Sua semana foi equilibrada.";
  }, [moodStats]);

  // 🗑️ Deletar mood
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
      ]
    );
  };

  // ✏️ Editar mood
  const handleEdit = (mood: any) => {
    setSelectedMood(mood);
    setEditModalVisible(true);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard emocional</Text>

      {/* 🔘 filtro */}
      <View style={styles.filterRow}>
        {["7d", "30d", "all"].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p as any)}
            style={[styles.filterButton, period === p && styles.filterActive]}
          >
            <Text style={styles.filterText}>
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "Todos"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 métricas */}
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

      <Text style={styles.feedback}>{feedbackMessage}</Text>

      {/* 📊 gráfico */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo emocional</Text>

          <BarChart
            data={barData}
            width={screenWidth - 40}
            height={180}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              decimalPlaces: 0,
              color: () => "#2dd4bf",
              labelColor: () => "#94A3B8",
              propsForBackgroundLines: {
                stroke: "transparent",
              },
            }}
            style={{ borderRadius: 12 }}
          />

          <View style={{ marginTop: 12 }}>
            <Text style={styles.text}>😊 Bons: {moodStats.good}</Text>
            <Text style={styles.text}>😐 Neutros: {moodStats.neutral}</Text>
            <Text style={styles.text}>😞 Ruins: {moodStats.bad}</Text>
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

      {/* 📋 histórico */}
      <TouchableOpacity style={styles.button} onPress={() => setShowHistory(true)}>
        <Text style={styles.buttonText}>Ver histórico</Text>
      </TouchableOpacity>

      {/* 📦 Modal de histórico com edição e exclusão */}
      <Modal visible={showHistory} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Histórico completo</Text>

          <ScrollView>
            {filteredHistory.map((item, index) => (
              <View key={item.id || index} style={styles.historyItem}>
                <View style={styles.historyContent}>
                  <Text style={styles.text}>
                    📅 {formatDate(item.date)}
                  </Text>
                  <Text style={styles.text}>
                    😊 Nível: {item.level}/5
                  </Text>
                  {item.note ? (
                    <Text style={styles.noteText}>
                      📝 {item.note}
                    </Text>
                  ) : null}
                  {item.triggers && item.triggers.length > 0 ? (
                    <Text style={styles.triggerText}>
                      🎯 Gatilhos: {item.triggers.map((t: any) => t.name || t).join(", ")}
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
    padding: 16,
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
  button: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#2dd4bf",
    alignItems: "center",
  },
  buttonText: {
    color: "#02120F",
    fontWeight: "800",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#060912",
    padding: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
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