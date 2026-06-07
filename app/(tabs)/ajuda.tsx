import { api } from "@/services/api";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";


type Mood = {
  id: number;
  level: number;
  mood?: string;
  title?: string;
};

type Resource = {
  id: number;
  type: "video" | "musica" | "livro" | "exercicio";
  title: string;
  description?: string | null;
  url?: string | null;
  author?: string | null;
  duration_minutes?: number | null;
  tags?: string[] | null;
};

export default function AjudaScreen() {
  const router = useRouter();

  const background = useThemeColor({}, "background");
  const card = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const border = useThemeColor({}, "border");
  const primary = useThemeColor({}, "primary");

  const [lastMood, setLastMood] = useState<Mood | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"todos" | Resource["type"]>(
    "todos",
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  async function loadData() {
    try {
      setLoading(true);

      const moodsRes = await api.get("/moods?per_page=1");
      const mood = moodsRes.data?.data?.[0] ?? null;
      setLastMood(mood);

      const resRes = await api.get("/resources?per_page=50");
      const list: Resource[] = resRes.data?.data ?? [];
      setResources(list);
    } catch (e: any) {
      console.log(
        "Erro Ajuda:",
        e?.response?.status,
        e?.response?.data,
        e?.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const level = lastMood?.level ?? 3;

  const getMoodState = () => {
    if (level <= 2) return "bad";
    if (level === 3) return "neutral";
    return "good";
  };

  const moodState = getMoodState();

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === "todos" || r.type === filterType;

      return matchSearch && matchType;
    });
  }, [resources, search, filterType]);

  const byType = useMemo(() => {
    const map = {
      exercicio: [] as Resource[],
      video: [] as Resource[],
      musica: [] as Resource[],
      livro: [] as Resource[],
    };

    for (const r of filteredResources) {
      if (r?.type && map[r.type]) map[r.type].push(r);
    }

    return map;
  }, [filteredResources]);

  function openUrl(url?: string | null) {
    if (!url) return;
    Linking.openURL(url);
  }

  function renderSection(title: string, items: Resource[]) {
    if (!items || items.length === 0) return null;

    return (
      <View style={{ marginTop: 20 }}>
        <Text
          style={[
            s.sectionTitle,
            {
              color: background === "#020817" ? "#E5E7EB" : "#334155",
            }
          ]}
        >
          {title}
        </Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {items.map((it) => (
            <View
              key={String(it.id)}
              style={[
                s.card,
                background === "#020817"
                  ? {}
                  : {
                      backgroundColor: "#CEE7F2",
                      borderColor: "#C5D3DA",
                    }
              ]}
            >
              <Text
                style={[
                  s.cardTitle,
                  background === "#020817" ? {} : { color: "#1E293B" },
                ]}
              >
                {it.title}
              </Text>
              {!!it.author && (
                <Text
                  style={[
                    s.meta,
                    background === "#020817" ? {} : { color: "#475569" },
                  ]}
                >
                  Por: {it.author}
                </Text>
              )}

              {!!it.duration_minutes && (
                <Text
                  style={[
                    s.meta,
                    background === "#020817" ? {} : { color: "#475569" },
                  ]}
                >
                  Duração: {it.duration_minutes} min
                </Text>
              )}

              {!!it.description && (
                <Text
                  style={[
                    s.cardDesc,
                    background === "#020817" ? {} : { color: "#475569" },
                  ]}
                >
                  {it.description}
                </Text>
              )}

              {!!it.url && (
                <Pressable style={s.btn} onPress={() => openUrl(it.url)}>
                  <Text style={s.btnText}>Abrir</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        s.container,
        {
          backgroundColor: background,
        },
      ]}
      contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
    >
      {/* 🔍 BUSCA */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar recurso..."
        placeholderTextColor="#6B7280"
        style={s.input}
      />

      {/* 🎯 FILTROS */}
      <View style={s.filterRow}>
        {["todos", "video", "musica", "livro", "exercicio"].map((type) => (
          <Pressable
            key={type}
            onPress={() => setFilterType(type as any)}
            style={[s.chip, filterType === type && s.chipActive]}
          >
            <Text
              style={{
                color: background === "#020817" ? "#E5E7EB" : "#334155",
              }}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* GOOD */}
      {moodState === "good" && (
        <>
          <View style={s.goodCard}>
            <Text style={s.goodTitle}>🌟 Que bom que você está bem!</Text>
            <Text style={s.goodText}>
              Aproveite este momento para se desenvolver ainda mais.
            </Text>
          </View>

          {renderSection("📚 Desenvolvimento pessoal", byType.livro)}
          {renderSection("🎥 Vídeos inspiradores", byType.video)}
          {renderSection("🎵 Músicas para energizar", byType.musica)}
          {renderSection("🧘 Exercícios opcionais", byType.exercicio)}
        </>
      )}

      {/* NEUTRAL */}
      {moodState === "neutral" && (
        <>
          <View style={s.neutralCard}>
            <Text style={s.neutralTitle}>🌿 Dia estável</Text>
            <Text style={s.neutralText}>Manter o equilíbrio é importante.</Text>
          </View>

          {renderSection("🧘 Exercícios leves", byType.exercicio)}
          {renderSection("🎥 Vídeos recomendados", byType.video)}
          {renderSection("🎵 Músicas recomendadas", byType.musica)}
        </>
      )}

      {/* BAD */}
      {moodState === "bad" && (
        <>
          <View style={s.alertCard}>
            <Text style={s.alertTitle}>💙 Você não está sozinha</Text>
            <Text
              style={[
                s.alertText,
                {
                  color: background === "#020817" ? "#CBD5E1" : "#334155",
                },
              ]}
            >
              Aqui estão alguns recursos que podem ajudar:
            </Text>
          </View>

          {/* CVV */}
          <Pressable
            style={s.cvvButton}
            onPress={() => Linking.openURL("tel:188")}
          >
            <Text style={s.cvvButtonText}>📞 Ligar para o CVV (188)</Text>
            <Text style={s.cvvButtonSubtext}>Atendimento gratuito 24h</Text>
          </Pressable>

          {/* 🔥 PSICÓLOGA RESTAURADA */}
          <Pressable
            style={s.psicologaButton}
            onPress={() => Linking.openURL("mailto:psicologa@moodup.com.br")}
          >
            <Text style={s.psicologaButtonText}>🎓 Falar com a psicóloga</Text>
            <Text style={s.psicologaButtonSubtext}>
              Envie um e-mail para agendar
            </Text>
          </Pressable>

          {/* IA */}
          <Pressable
            style={s.aiButton}
            onPress={() => router.push("/(tabs)/sugestoes")}
          >
            <Text style={s.aiButtonText}>💬 Conversar com a IA</Text>
            <Text style={s.aiButtonSubtext}>Desabafe de forma anônima</Text>
          </Pressable>

          {renderSection("🧘 Exercícios para agora", byType.exercicio)}
          {renderSection("🎥 Vídeos para acalmar", byType.video)}
          {renderSection("🎵 Músicas para relaxar", byType.musica)}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { color: "#E5E7EB", fontSize: 24, fontWeight: "900" },

  input: {
    backgroundColor: "#0B1220",
    borderColor: "#243041",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    color: "#E5E7EB",
    marginTop: 12,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#243041",
  },

  chipActive: {
    borderColor: "#2dd4bf",
    backgroundColor: "rgba(45,212,191,.15)",
  },

  sectionTitle: { color: "#E5E7EB", fontSize: 18, fontWeight: "800" },

  card: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
  },

  cardTitle: { color: "#E5E7EB", fontWeight: "900" },
  meta: { color: "#94A3B8", fontSize: 12 },
  cardDesc: { color: "#94A3B8" },

  btn: {
    marginTop: 10,
    backgroundColor: "#2dd4bf",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: { fontWeight: "900" },

  goodCard: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },

  neutralCard: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
  },

  alertCard: {
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.3)",
  },

  goodTitle: { color: "#22c55e", fontSize: 18, fontWeight: "900" },
  neutralTitle: { color: "#eab308", fontSize: 18, fontWeight: "900" },
  alertTitle: { color: "#facc15", fontSize: 18, fontWeight: "900" },

  goodText: { color: "#CBD5E1" },
  neutralText: { color: "#CBD5E1" },
  alertText: { color: "#CBD5E1" },

  cvvButton: {
    backgroundColor: "#cf6060",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    alignItems: "center",
  },

  cvvButtonText: { color: "#fff", fontWeight: "900" },
  cvvButtonSubtext: { color: "#fff", fontSize: 12 },

  psicologaButton: {
    backgroundColor: "#72dbc1",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    alignItems: "center",
  },

  psicologaButtonText: { color: "#08101a", fontWeight: "900" },
  psicologaButtonSubtext: { color: "#08101a", fontSize: 12 },

  aiButton: {
    backgroundColor: "#85a3e2",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    alignItems: "center",
  },

  aiButtonText: { color: "#08101a", fontWeight: "900" },
  aiButtonSubtext: { color: "#08101a", fontSize: 12 },
});
