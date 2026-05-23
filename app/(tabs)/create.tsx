import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { DatePickerModal } from "react-native-paper-dates";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";

const MOODS = [
  { key: "muito_triste", emoji: "😞", label: "Muito mal" },
  { key: "triste", emoji: "😕", label: "Mal" },
  { key: "neutro", emoji: "😐", label: "Ok" },
  { key: "bem", emoji: "🙂", label: "Bem" },
  { key: "muito_bem", emoji: "😁", label: "Ótimo" },
] as const;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2dd4bf",
    surface: "#0F172A",
    background: "#0F172A",
    text: "#E5E7EB",
    onSurface: "#E5E7EB",
    backdrop: "rgba(0,0,0,0.7)",
  },
};

export default function CreateMood() {
  const router = useRouter();

  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [moodKey, setMoodKey] =
    useState<(typeof MOODS)[number]["key"]>("neutro");

  const [selectedTriggers, setSelectedTriggers] = useState<number[]>([]);
  const [triggersList, setTriggersList] = useState<any[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [triggerNamesForHelp, setTriggerNamesForHelp] = useState("");
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setLevel(3);
    setDate(new Date());
    setNote("");
    setMoodKey("neutro");
    setSelectedTriggers([]);
    setErro("");
    setShowHelpModal(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [resetForm])
  );

  useEffect(() => {
    async function loadTriggers() {
      try {
        setLoadingTriggers(true);
        const response = await api.get("/triggers");
        const data = response.data.data || response.data;
        setTriggersList(data);
      } catch (error) {
        console.error("Erro ao carregar gatilhos:", error);
      } finally {
        setLoadingTriggers(false);
      }
    }

    loadTriggers();
  }, []);

  const moodSelected = useMemo(
    () => MOODS.find((m) => m.key === moodKey),
    [moodKey]
  );

  const lvl = Number(level);

  function toggleTrigger(triggerId: number) {
    setSelectedTriggers((prev) =>
      prev.includes(triggerId)
        ? prev.filter((id) => id !== triggerId)
        : [...prev, triggerId]
    );
  }

  function levelText(n: number) {
    if (n <= 1) return "Muito baixo";
    if (n === 2) return "Baixo";
    if (n === 3) return "Ok";
    if (n === 4) return "Bom";
    return "Ótimo";
  }

  function showToast() {
    setShowSavedToast(true);

    setTimeout(() => {
      setShowSavedToast(false);
    }, 2500);
  }

  function formatDateToDisplay(dateObj: Date) {
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function formatDateToAPI(dateObj: Date) {
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${year}-${month}-${day}`;
  }

  async function handleCreate() {
    setErro("");

    if (loading) return;

    if (!title.trim()) {
      setErro("Digite um título.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/moods", {
        title: title.trim(),
        level: lvl,
        score: lvl,
        date: formatDateToAPI(date),
        note: note.trim() ? note.trim() : null,
        mood: moodKey,
        trigger_ids: selectedTriggers,
      });

      showToast();

      const humorRuim =
        moodKey === "muito_triste" || moodKey === "triste";

      const temGatilho = selectedTriggers.length > 0;

      if (humorRuim && temGatilho) {
        const triggerNames = selectedTriggers
          .map((id) => {
            const trigger = triggersList.find((t) => t.id === id);
            return trigger?.name || trigger?.label;
          })
          .filter(Boolean)
          .join(", ");

        if (triggerNames) {
          setTriggerNamesForHelp(triggerNames);

          setTimeout(() => {
            setShowHelpModal(true);
          }, 900);

          return;
        }
      }

      setTimeout(() => {
        resetForm();
      }, 1200);
    } catch (e: any) {
      console.error("Erro ao salvar:", e?.response?.data || e);
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível criar o mood."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHelpChoice(wantsHelp: boolean) {
    setShowHelpModal(false);

    if (wantsHelp) {
      router.push({
        pathname: "/sugestoes",
        params: {
          trigger: triggerNamesForHelp,
        },
      } as any);

      return;
    }

    resetForm();
  }

  return (
    <PaperProvider theme={theme}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.container}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.card}>
              <Text style={s.title}>Criar mood</Text>
              <Text style={s.subtitle}>Registre como você está hoje</Text>

              <Text style={s.label}>Humor</Text>

              <View style={s.row}>
                {MOODS.map((m) => {
                  const active = m.key === moodKey;

                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => setMoodKey(m.key)}
                      style={[s.emojiBtn, active && s.emojiBtnActive]}
                    >
                      <Text style={s.emoji}>{m.emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={s.muted}>
                Selecionado: {moodSelected?.emoji} • {moodSelected?.label}
              </Text>

              <Text style={s.label}>Como você descreve hoje?</Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Produtivo, cansativo, inspirador..."
                placeholderTextColor="#6B7280"
                style={s.input}
              />

              <Text style={s.label}>Nível (1 a 5)</Text>

              <View style={s.levelRow}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = level === n;

                  return (
                    <Pressable
                      key={n}
                      onPress={() => setLevel(n as any)}
                      style={[s.levelBtn, active && s.levelBtnActive]}
                    >
                      <Text style={[s.levelText, active && s.levelTextActive]}>
                        {n}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={s.muted}>Intensidade: {levelText(level)}</Text>

              <Text style={s.label}>Data</Text>

              <Pressable
                style={s.dateInput}
                onPress={() => setOpenDatePicker(true)}
              >
                <View style={s.dateContent}>
                  <Text style={s.dateText}>{formatDateToDisplay(date)}</Text>

                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#94A3B8"
                  />
                </View>
              </Pressable>

              <DatePickerModal
                locale="pt"
                mode="single"
                visible={openDatePicker}
                onDismiss={() => setOpenDatePicker(false)}
                date={date}
                onConfirm={(params) => {
                  setOpenDatePicker(false);

                  if (params.date) {
                    setDate(params.date);
                  }
                }}
                validRange={{
                  startDate: ontem,
                  endDate: hoje,
                }}
                animationType="fade"
                label="Selecione uma data"
                saveLabel="Confirmar"
                uppercase={false}
              />

              <Text style={s.label}>O que pode ter influenciado esse humor?</Text>

              {loadingTriggers ? (
                <Text style={s.muted}>Carregando gatilhos...</Text>
              ) : (
                <>
                  <View style={s.triggersWrap}>
                    {triggersList.map((trigger) => {
                      const active = selectedTriggers.includes(trigger.id);

                      return (
                        <Pressable
                          key={trigger.id}
                          onPress={() => toggleTrigger(trigger.id)}
                          style={[s.chip, active && s.chipActive]}
                        >
                          <Text style={[s.chipText, active && s.chipTextActive]}>
                            {trigger.label || trigger.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {selectedTriggers.length > 0 && (
                    <Text style={s.muted}>
                      {selectedTriggers.length} gatilho(s) selecionado(s)
                    </Text>
                  )}
                </>
              )}

              <Text style={s.label}>Observação (opcional)</Text>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="O que aconteceu hoje?"
                placeholderTextColor="#6B7280"
                style={[s.input, { height: 110 }]}
                multiline
              />

              {erro ? <Text style={s.errorText}>{erro}</Text> : null}

              <Pressable
                onPress={handleCreate}
                disabled={loading}
                style={[s.button, loading && { opacity: 0.6 }]}
              >
                <Text style={s.buttonText}>
                  {loading ? "SALVANDO..." : "SALVAR"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                style={{ marginTop: 12, alignItems: "center" }}
              >
                <Text style={s.linkText}>Voltar</Text>
              </Pressable>

              <View style={{ height: 24 }} />
            </View>
          </ScrollView>

          {showSavedToast && (
            <View style={s.toast}>
              <Text style={s.toastText}>Seu registro foi salvo 💙</Text>
            </View>
          )}

          <Modal
            visible={showHelpModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowHelpModal(false)}
          >
            <View style={s.modalOverlay}>
              <View style={s.modalContainer}>
                <Text style={s.modalEmoji}>💬</Text>

                <Text style={s.modalTitle}>Quer conversar sobre isso?</Text>

                <Text style={s.modalSubtitle}>
                  Percebemos que você está se sentindo mal relacionado a{" "}
                  {triggerNamesForHelp}. Gostaria de refletir um pouco e ver
                  algumas sugestões?
                </Text>

                <View style={s.modalButtons}>
                  <Pressable
                    style={[s.modalBtn, s.modalBtnSim]}
                    onPress={() => handleHelpChoice(true)}
                  >
                    <Text style={s.modalBtnSimText}>Sim, quero conversar</Text>
                  </Pressable>

                  <Pressable
                    style={[s.modalBtn, s.modalBtnNao]}
                    onPress={() => handleHelpChoice(false)}
                  >
                    <Text style={s.modalBtnNaoText}>Agora não</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: "#0F172A",
    borderColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94A3B8",
    marginBottom: 18,
  },
  label: {
    color: "#CBD5E1",
    marginBottom: 6,
    marginTop: 10,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#0B1220",
    borderColor: "#243041",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#E5E7EB",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#243041",
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtnActive: {
    borderColor: "#2dd4bf",
  },
  emoji: {
    fontSize: 26,
  },
  muted: {
    color: "#94A3B8",
    marginTop: 6,
  },
  levelRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  levelBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#243041",
    backgroundColor: "#0B1220",
    alignItems: "center",
    justifyContent: "center",
  },
  levelBtnActive: {
    borderColor: "#2dd4bf",
    backgroundColor: "rgba(45,212,191,.15)",
  },
  levelText: {
    color: "#E5E7EB",
    fontWeight: "800",
  },
  levelTextActive: {
    color: "#2dd4bf",
  },
  triggersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#243041",
    backgroundColor: "#0B1220",
  },
  chipActive: {
    borderColor: "#2dd4bf",
    backgroundColor: "rgba(45,212,191,.15)",
  },
  chipText: {
    color: "#E5E7EB",
    fontWeight: "500",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#2dd4bf",
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 10,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#2dd4bf",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#08101a",
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  linkText: {
    color: "#E5E7EB",
    opacity: 0.9,
  },
  toast: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#0F172A",
    borderColor: "#2dd4bf",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    zIndex: 20,
  },
  toastText: {
    color: "#E5E7EB",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2dd4bf",
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnSim: {
    backgroundColor: "#2dd4bf",
  },
  modalBtnSimText: {
    color: "#08101a",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  modalBtnNao: {
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  modalBtnNaoText: {
    color: "#E5E7EB",
    fontWeight: "500",
    fontSize: 13,
    textAlign: "center",
  },
  dateInput: {
    backgroundColor: "#0B1220",
    borderColor: "#243041",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    color: "#E5E7EB",
    fontSize: 16,
  },
});