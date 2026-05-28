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
import { router } from "expo-router";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  const [weekly, setWeekly] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [topTriggers, setTopTriggers] = useState<any[]>([]);
  const [statsOverview, setStatsOverview] = useState<any>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");
  
  // Estados para edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<any>(null);

  async function loadData() {
    try {
      setLoading(true);

      const [weeklyResponse, historyResponse, insightsResponse] = await Promise.all([
        moodApi.getWeeklySummary(),
        moodApi.getAll(),
        moodApi.getWeeklyInsights(),
      ]);

      setWeekly(weeklyResponse.data || null);

      let historyData = [];
      if (historyResponse.data?.data && Array.isArray(historyResponse.data.data)) {
        historyData = historyResponse.data.data;
      } else if (Array.isArray(historyResponse.data)) {
        historyData = historyResponse.data;
      } else {
        historyData = [];
      }
      
      setHistory(historyData);
      setInsights(insightsResponse.data || null);
      
    } catch (error: any) {
      console.log("❌ ERRO DASH:", error?.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setLoading(false);
    }
  }

  async function loadStatistics() {
    try {
      setLoadingStats(true);
      const [triggersRes, statsRes] = await Promise.all([
        moodApi.getTopTriggers?.(30, 5) || Promise.resolve({ data: { triggers: [] } }),
        moodApi.getStatsOverview?.(30) || Promise.resolve({ data: null })
      ]);
      
      setTopTriggers(triggersRes.data?.triggers || []);
      setStatsOverview(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadStatistics();
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* 📊 Seção de Estatísticas e Gatilhos */}
      <Animated.View entering={FadeInUp.delay(250)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Seus hábitos</Text>
          
          {loadingStats ? (
            <ActivityIndicator color="#2dd4bf" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {/* Gatilhos mais usados */}
              {topTriggers.length > 0 && (
                <View style={styles.statsSection}>
                  <Text style={styles.statsSubtitle}>🎯 Gatilhos mais frequentes</Text>
                  {topTriggers.map((trigger, idx) => (
                    <View key={trigger.id} style={styles.statItem}>
                      <View style={styles.statHeader}>
                        <Text style={styles.statRank}>{idx + 1}º</Text>
                        <Text style={styles.statName}>{trigger.name}</Text>
                        <Text style={styles.statValue}>{trigger.total}x</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${(trigger.total / topTriggers[0]?.total) * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Resumo rápido */}
              {statsOverview && (
                <View style={styles.statsSection}>
                  <Text style={styles.statsSubtitle}>📈 Resumo do período</Text>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{statsOverview.total_entries || 0}</Text>
                      <Text style={styles.summaryLabel}>Registros</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{statsOverview.average_level || '-'}</Text>
                      <Text style={styles.summaryLabel}>Média</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{statsOverview.days_with_entries || 0}</Text>
                      <Text style={styles.summaryLabel}>Dias ativos</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.View>

      {/* 📅 calendário */}
      <Animated.View entering={FadeInUp.delay(300)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seu mês</Text>
          <MoodCalendar data={filteredHistory} />
        </View>
      </Animated.View>

      {/* 📋 Botões de ação - lado a lado */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonHistory]} 
          onPress={() => setShowHistory(true)}
        >
          <Text style={styles.buttonText}>📋 Histórico</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonReports]} 
          onPress={() => router.push('/relatorios')}
        >
          <Text style={styles.buttonReportsText}>📊 Relatórios</Text>
        </TouchableOpacity>
      </View>

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
          loadStatistics();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060912",
    padding: 8,
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
    backgroundColor: "rgba(92, 87, 87, 0.04)",
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
    backgroundColor: "rgba(96, 90, 100, 0.03)",
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
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonHistory: {
    backgroundColor: "#2dd4bf",
  },
  buttonReports: {
    backgroundColor: "rgba(45,212,191,0.1)",
    borderWidth: 1,
    borderColor: "#2dd4bf",
  },
  buttonText: {
    color: "#02120F",
    fontWeight: "800",
  },
  buttonReportsText: {
    color: "#2dd4bf",
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
  // Estilos para estatísticas
  statsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  statsSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  statItem: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statRank: {
    color: '#2dd4bf',
    fontSize: 14,
    fontWeight: 'bold',
    width: 35,
  },
  statName: {
    color: '#CBD5E1',
    fontSize: 14,
    flex: 1,
  },
  statValue: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginLeft: 35,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2dd4bf',
    borderRadius: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#2dd4bf',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
});