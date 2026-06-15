import MoodCalendar from "@/components/MoodCalendar";
import EditMoodModal from "@/components/EditMoodModal";
import { moodApi, api } from "@/services/api";
import React, { useCallback, useMemo, useState } from "react";
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
  TextInput,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const background = useThemeColor({}, "background");
  const isLight = background === "#EEF2F7";

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<any>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [expiredModalVisible, setExpiredModalVisible] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [moodToDelete, setMoodToDelete] = useState<any>(null);

  const getMoodLabel = (level: number) => {
    if (level === 1) return "😔 Muito triste";
    if (level === 2) return "😕 Triste";
    if (level === 3) return "😐 Neutro";
    if (level === 4) return "😊 Feliz";
    if (level === 5) return "😁 Muito feliz";
    return "🙂 Registro emocional";
  };

  const formatDate = (dateString: string) => {
    const onlyDate = dateString.split("T")[0];
    const [year, month, day] = onlyDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const canEditOrDelete = (moodDate: string) => {
    const createdAt = new Date(moodDate);
    const now = new Date();

    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    return diffHours <= 24;
  };

  async function loadData() {
    try {
      const historyResponse = await moodApi.getAll();

      let historyData = [];

      if (
        historyResponse.data?.data &&
        Array.isArray(historyResponse.data.data)
      ) {
        historyData = historyResponse.data.data;
      } else if (Array.isArray(historyResponse.data)) {
        historyData = historyResponse.data;
      }

      setHistory(historyData);

      console.log("Primeiro Registro:", historyData[0]);
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
      setIsAdmin(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadAll = async () => {
        setLoading(true);
        await Promise.all([loadData(), checkAdminStatus()]);
        setLoading(false);
      };

      loadAll();
    }, []),
  );

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

  const searchedHistory = useMemo(() => {
    const search = historySearch.trim().toLowerCase();

    if (!search) return filteredHistory;

    return filteredHistory.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const note = String(item.note || "").toLowerCase();
      const date = formatDate(item.date).toLowerCase();
      const level = getMoodLabel(item.level).toLowerCase();

      const triggers =
        item.triggers
          ?.map((t: any) => t.name || t)
          .join(" ")
          .toLowerCase() || "";

      return (
        title.includes(search) ||
        note.includes(search) ||
        date.includes(search) ||
        level.includes(search) ||
        triggers.includes(search)
      );
    });
  }, [filteredHistory, historySearch]);

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

    return {
      labels:
        period === "7d"
          ? chartHistory.map((item) => formatDate(item.date).split("/")[0])
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

  const feedbackMessage = useMemo(() => {
    if (moodStats.good > moodStats.bad)
      return "🎉 Você teve mais dias bons essa semana!";
    if (moodStats.bad > moodStats.good)
      return "💙 Semana mais difícil, cuide-se.";
    return "⚖️ Sua semana foi equilibrada.";
  }, [moodStats]);

  const openDeleteModal = (mood: any) => {
    setMoodToDelete(mood);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setMoodToDelete(null);
  };

  const confirmDelete = async () => {
    if (!moodToDelete) return;

    try {
      await moodApi.delete(moodToDelete.id);
      await loadData();
      closeDeleteModal();
    } catch (error: any) {
      console.log("DELETE ERRO:", error?.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível excluir o registro");
    }
  };

  const handleEdit = (mood: any) => {
    setSelectedMood(mood);
    setEditModalVisible(true);
  };

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

      <View style={styles.row}>
        <Animated.View entering={FadeInUp}>
          <View
            style={[
              styles.metricCard,
              isLight && {
                backgroundColor: "#D4E0E6",
                borderWidth: 1,
                borderColor: "#B8CAD3",
              },
            ]}
          >
            <Text style={styles.metricValue}>{filteredHistory.length}</Text>
            <Text style={styles.metricLabel}>Registros</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100)}>
          <View
            style={[
              styles.metricCard,
              isLight && {
                backgroundColor: "#D4E0E6",
                borderWidth: 1,
                borderColor: "#B8CAD3",
              },
            ]}
          >
            <Text style={styles.metricValue}>{streak}</Text>
            <Text style={styles.metricLabel}>Streak 🔥</Text>
          </View>
        </Animated.View>
      </View>

      <Text style={[styles.feedback, isLight && { color: "#64748B" }]}>
        {feedbackMessage}
      </Text>

      <Animated.View entering={FadeInUp.delay(200)}>
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
          <Text style={styles.cardTitle}>Resumo emocional</Text>
          <LineChart
            data={lineData}
            width={Math.min(width - 56, 700)}
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
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#2dd4bf",
              },
            }}
            style={{ borderRadius: 12, alignSelf: "center" }}
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

      <Animated.View entering={FadeInUp.delay(300)}>
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
          <Text style={styles.cardTitle}>Seu mês</Text>
          <MoodCalendar data={filteredHistory} />
        </View>
      </Animated.View>

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

      <Modal visible={showHistory} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            isLight && { backgroundColor: "#C7D7DF" },
          ]}
        >
          <Text style={[styles.title, isLight && { color: "#334155" }]}>
            Histórico emocional
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por data, título, gatilho ou observação..."
            placeholderTextColor="#64748B"
            value={historySearch}
            onChangeText={setHistorySearch}
          />

          <ScrollView>
            {searchedHistory.length > 0 ? (
              searchedHistory.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[
                    styles.historyItem,
                    isLight && {
                      backgroundColor: "#D4E0E6",
                      borderWidth: 1,
                      borderColor: "#B8CAD3",
                    },
                  ]}
                >
                  <View style={styles.historyContent}>
                    <Text
                      style={[
                        styles.historyTitle,
                        isLight && { color: "#334155" },
                      ]}
                    >
                      📌 {item.title || "Registro emocional"}
                    </Text>

                    <Text
                      style={[styles.text, isLight && { color: "#64748B" }]}
                    >
                      📅 {formatDate(item.date)}
                    </Text>

                    {item.triggers && item.triggers.length > 0 ? (
                      <Text style={styles.triggerText}>
                        🎯 Gatilhos:{" "}
                        {item.triggers.map((t: any) => t.name || t).join(", ")}
                      </Text>
                    ) : (
                      <Text style={styles.emptyInfoText}>
                        🎯 Nenhum gatilho informado
                      </Text>
                    )}

                    {item.note ? (
                      <Text
                        style={[
                          styles.noteText,
                          isLight && { color: "#64748B" },
                        ]}
                      >
                        📝 {item.note}
                      </Text>
                    ) : (
                      <Text style={styles.emptyInfoText}>
                        📝 Sem observação
                      </Text>
                    )}

                    <Text
                      style={[
                        styles.intensityText,
                        isLight && { color: "#64748B" },
                      ]}
                    >
                      ⭐ Intensidade: {item.level}/5
                    </Text>

                    <Text
                      style={{
                        color: !canEditOrDelete(item.created_at)
                          ? "#ef4444"
                          : "#2dd4bf",
                        marginTop: 6,
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {!canEditOrDelete(item.created_at)
                        ? "🔒 Período de edição encerrado"
                        : "⏳ Editável por 24 horas"}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        !canEditOrDelete(item.created_at) && {
                          opacity: 0.4,
                        },
                      ]}
                      onPress={() => {
                        if (!canEditOrDelete(item.created_at || item.date)) {
                          setExpiredMessage(
                            "Este registro só pode ser editado nas primeiras 24 horas após sua criação.",
                          );

                          setExpiredModalVisible(true);
                          return;
                        }

                        setShowHistory(false);
                        handleEdit(item);
                      }}
                    >
                      <Text style={styles.actionText}>✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        !canEditOrDelete(item.created_at) && {
                          opacity: 0.4,
                        },
                      ]}
                      onPress={() => {
                        if (!canEditOrDelete(item.created_at || item.date)) {
                          setExpiredMessage(
                            "Este registro só pode ser excluído nas primeiras 24 horas após sua criação.",
                          );

                          setExpiredModalVisible(true);
                          return;
                        }

                        openDeleteModal(item);
                      }}
                    >
                      <Text style={styles.actionText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyHistoryText}>
                Nenhum registro encontrado.
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Excluir registro?</Text>

            <Text style={styles.confirmText}>
              Essa ação vai apagar este registro emocional. Deseja continuar?
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={closeDeleteModal}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={expiredModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>🔒 Prazo expirado</Text>

            <Text style={styles.confirmText}>{expiredMessage}</Text>

            <TouchableOpacity
              style={styles.expiredButton}
              onPress={() => setExpiredModalVisible(false)}
            >
              <Text style={styles.expiredButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    backgroundColor: "#060912",
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
    fontSize: 13,
    marginTop: 5,
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
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#E2E8F0",
    fontSize: 14,
    marginBottom: 14,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  historyContent: {
    flex: 1,
    paddingRight: 10,
  },
  historyTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  levelText: {
    color: "#2dd4bf",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  noteText: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },
  triggerText: {
    color: "#2dd4bf",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },
  emptyInfoText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 8,
    fontStyle: "italic",
  },
  intensityText: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
  },
  emptyHistoryText: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  actionButtons: {
    flexDirection: "column",
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  confirmTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  confirmText: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 22,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  cancelText: {
    color: "#E2E8F0",
    fontWeight: "700",
  },
  deleteConfirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#ef4444",
  },
  deleteConfirmText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  expiredButton: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#2dd4bf",
    alignItems: "center",
  },

  expiredButtonText: {
    color: "#02120F",
    fontWeight: "800",
  },
});
