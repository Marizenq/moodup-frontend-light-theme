import MoodCalendar from "@/components/MoodCalendar";
import { api } from "@/services/api";

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

  async function loadData() {
    try {
      setLoading(true);

      const [w, h, i] = await Promise.all([
        api.get("/moods/summary/weekly"),
        api.get("/moods"),
        api.get("/moods/insights/weekly"),
      ]);

      setWeekly(w.data || null);

      setHistory(
        Array.isArray(h.data?.data)
          ? h.data.data
          : Array.isArray(h.data)
          ? h.data
          : []
      );

      setInsights(i.data || null);
    } catch (error: any) {
      console.log("ERRO DASH:", error?.response?.data || error.message);
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
      const diff =
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (period === "7d") return diff <= 7;
      if (period === "30d") return diff <= 30;
      return true;
    });
  }, [history, period]);

  // 🔥 streak
  function calculateStreak(data: any[]) {
    let streak = 0;

    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      const today = new Date();
      const date = new Date(sorted[i].date);

      const diff = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === i) streak++;
      else break;
    }

    return streak;
  }

  const streak = calculateStreak(history);

  // 📊 estatísticas (SUBSTITUI MÉDIA)
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
        data: [
          moodStats.bad,
          moodStats.neutral,
          moodStats.good,
        ],
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
            style={[
              styles.filterButton,
              period === p && styles.filterActive,
            ]}
          >
            <Text style={styles.filterText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 métricas */}
      <View style={styles.row}>
        <Animated.View entering={FadeInUp}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {filteredHistory.length}
            </Text>
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowHistory(true)}
      >
        <Text style={styles.buttonText}>Ver histórico</Text>
      </TouchableOpacity>

      {/* 📦 modal */}
      <Modal visible={showHistory} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Histórico completo</Text>

          <ScrollView>
            {history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.text}>
                  {item.date} → nível {item.level}
                </Text>
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
    padding: 8,
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  closeButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#E91E63",
    alignItems: "center",
  },
});