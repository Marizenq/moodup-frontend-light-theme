import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { moodApi } from "@/services/api";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function Reports() {
  const background = useThemeColor({}, "background");
  const isLight = background === "#EEF2F7";

  const [loading, setLoading] = useState(true);
  const [topTriggers, setTopTriggers] = useState<any[]>([]);
  const [statsOverview, setStatsOverview] = useState<any>(null);
  const [period, setPeriod] = useState(30);

  const loadReports = async () => {
    try {
      setLoading(true);

      let triggersData = [];
      let statsData = null;

      if (moodApi.getTopTriggers) {
        const triggersRes = await moodApi.getTopTriggers(period);
        triggersData = triggersRes.data?.triggers || [];
      }

      if (moodApi.getStatsOverview) {
        const statsRes = await moodApi.getStatsOverview(period);
        statsData = statsRes.data;
      }

      setTopTriggers(triggersData);
      setStatsOverview(statsData);
    } catch (error: any) {
      console.error("Erro ao carregar relatórios:", error);
      Alert.alert(
        "Erro",
        error?.response?.data?.message ||
          "Não foi possível carregar os relatórios",
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [period]),
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const onlyDate = dateString.split("T")[0];
    const [year, month, day] = onlyDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const emotionalStats = useMemo(() => {
    const distribution = statsOverview?.level_distribution || [];
    const total = Number(statsOverview?.total_entries || 0);

    const getTotalByLevel = (level: number) => {
      const found = distribution.find(
        (item: any) => Number(item.level) === level,
      );
      return Number(found?.total || 0);
    };

    const veryBad = getTotalByLevel(1);
    const bad = getTotalByLevel(2);
    const neutral = getTotalByLevel(3);
    const good = getTotalByLevel(4);
    const veryGood = getTotalByLevel(5);

    const negative = veryBad + bad;
    const positive = good + veryGood;

    const percent = (value: number) => {
      if (!total) return 0;
      return Math.round((value / total) * 100);
    };

    return {
      veryBad,
      bad,
      neutral,
      good,
      veryGood,
      negative,
      positive,
      negativePercent: percent(negative),
      neutralPercent: percent(neutral),
      positivePercent: percent(positive),
      average: Number(statsOverview?.average_level || 0),
    };
  }, [statsOverview]);

  const mainInsight = useMemo(() => {
    if (!statsOverview?.total_entries) {
      return "Ainda não há registros suficientes para gerar uma análise.";
    }

    if (emotionalStats.positive > emotionalStats.negative) {
      return "A maior parte dos registros deste período foi positiva.";
    }

    if (emotionalStats.negative > emotionalStats.positive) {
      return "Este período teve mais registros negativos, indicando uma fase emocional mais difícil.";
    }

    return "O período apresentou equilíbrio entre registros positivos e negativos.";
  }, [statsOverview, emotionalStats]);

  const topTriggerName = topTriggers[0]?.name || null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isLight && { backgroundColor: "#C7D7DF" }]}
    >
      <Text style={[styles.title, isLight && { color: "#334155" }]}>
        📊 Relatórios
      </Text>

      <View style={styles.periodRow}>
        {[7, 30, 90].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, isLight && { color: "#1E293B" }]}>
              {p} dias
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={[
          styles.card,
          isLight && {
            backgroundColor: "#D4E0E6",
            borderWidth: 1,
            borderColor: "#B8CAD3",
          },
        ]}
      >
        {" "}
        <Text style={styles.cardTitle}>🎯 Gatilhos mais frequentes</Text>
        {topTriggers.length > 0 ? (
          topTriggers.map((trigger, idx) => (
            <View key={trigger.id || idx} style={styles.triggerItem}>
              <Text style={styles.triggerRank}>{idx + 1}º</Text>
              <Text
                style={[styles.triggerName, isLight && { color: "#334155" }]}
              >
                {trigger.name}
              </Text>
              <Text
                style={[styles.triggerCount, isLight && { color: "#334155" }]}
              >
                {trigger.total}x
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Nenhum gatilho registrado neste período
          </Text>
        )}
      </View>

      <View
        style={[
          styles.card,
          isLight && {
            backgroundColor: "#D4E0E6",
            borderWidth: 1,
            borderColor: "#B8CAD3",
          },
        ]}
      >
        {" "}
        <Text style={styles.cardTitle}>📈 Visão geral</Text>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              isLight && {
                backgroundColor: "#E7EEF2",
                borderWidth: 1,
                borderColor: "#D5E1E7",
              },
            ]}
          >
            {" "}
            <Text style={styles.statBig}>
              {statsOverview?.total_entries || 0}
            </Text>
            <Text style={[styles.statLabel, isLight && { color: "#334155" }]}>
              registros
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              isLight && {
                backgroundColor: "#E7EEF2",
                borderWidth: 1,
                borderColor: "#D5E1E7",
              },
            ]}
          >
            <Text style={styles.statBig}>
              {statsOverview?.days_with_entries || 0}
            </Text>
            <Text style={[styles.statLabel, isLight && { color: "#334155" }]}>
              dias ativos
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.card,
          isLight && {
            backgroundColor: "#D4E0E6",
            borderWidth: 1,
            borderColor: "#B8CAD3",
          },
        ]}
      >
        {" "}
        <Text style={styles.cardTitle}>😊 Bem-estar emocional</Text>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              isLight && {
                backgroundColor: "#E7EEF2",
                borderWidth: 1,
                borderColor: "#D5E1E7",
              },
            ]}
          >
            <Text style={styles.statBig}>
              {emotionalStats.average.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, isLight && { color: "#334155" }]}>
              humor médio
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              isLight && {
                backgroundColor: "#E7EEF2",
                borderWidth: 1,
                borderColor: "#D5E1E7",
              },
            ]}
          >
            <Text style={styles.statBig}>
              {emotionalStats.positivePercent}%
            </Text>
            <Text style={[styles.statLabel, isLight && { color: "#334155" }]}>
              positivos
            </Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              isLight && {
                backgroundColor: "#E7EEF2",
                borderWidth: 1,
                borderColor: "#D5E1E7",
              },
            ]}
          >
            {" "}
            <Text style={styles.statBig}>{emotionalStats.neutralPercent}%</Text>
            <Text style={[styles.statLabel, isLight && { color: "#334155" }]}>
              neutros
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              isLight && {
                backgroundColor: "#E7EEF2",
                borderWidth: 1,
                borderColor: "#D5E1E7",
              },
            ]}
          >
            {" "}
            <Text style={styles.statBig}>
              {emotionalStats.negativePercent}%
            </Text>
            <Text style={[styles.statLabel, isLight && { color: "#334155" }]}>
              negativos
            </Text>
          </View>
        </View>
        <Text style={[styles.infoText, isLight && { color: "#334155" }]}>
          🏆 Melhor dia: ...
        </Text>
        <Text style={[styles.infoText, isLight && { color: "#334155" }]}>
          ⚠️ Dia mais difícil: {formatDate(statsOverview?.worst_day?.date)}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          isLight && {
            backgroundColor: "#D4E0E6",
            borderWidth: 1,
            borderColor: "#B8CAD3",
          },
        ]}
      >
        {" "}
        <Text style={styles.cardTitle}>📋 Resumo do período</Text>
        <Text style={[styles.insightText, isLight && { color: "#334155" }]}>
          💬 {mainInsight}
        </Text>
        {topTriggerName ? (
          <Text style={[styles.insightText, isLight && { color: "#334155" }]}>
            🎯 O gatilho mais frequente foi {topTriggerName}.
          </Text>
        ) : (
          <Text style={[styles.insightText, isLight && { color: "#334155" }]}>
            🎯 Nenhum gatilho predominante foi identificado.
          </Text>
        )}
        <Text style={[styles.insightText, isLight && { color: "#334155" }]}>
          📅 Você registrou emoções em {statsOverview?.days_with_entries || 0}{" "}
          dias diferentes.
        </Text>
      </View>
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
    backgroundColor: "#060912",
  },
  title: {
    color: "#E2E8F0",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  periodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  periodActive: {
    backgroundColor: "rgba(45,212,191,0.25)",
  },
  periodText: {
    color: "#CBD5F5",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#2dd4bf",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  triggerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  triggerRank: {
    color: "#2dd4bf",
    fontSize: 16,
    fontWeight: "bold",
    width: 40,
  },
  triggerName: {
    color: "#CBD5E1",
    fontSize: 16,
    flex: 1,
  },
  triggerCount: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statBig: {
    color: "#2dd4bf",
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
  },
  infoText: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 8,
  },
  insightText: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
});
