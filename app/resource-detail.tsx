import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";

export default function ResourceDetail() {
  const params = useLocalSearchParams();

  const title = params.title as string;
  const description = params.description as string;
  const author = params.author as string;
  const type = params.type as string;
  const duration = params.duration as string;
  const url = params.url as string | undefined;
  const tags = (params.tags as string | undefined)?.split(",") ?? [];

  function openUrl() {
    if (url) Linking.openURL(url);
  }

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>{title}</Text>

      <Text style={s.meta}>
        {type ? `Tipo: ${type}` : ""}
        {duration ? ` • ${duration} min` : ""}
      </Text>

      {author && (
        <Text style={s.meta}>Autor: {author}</Text>
      )}

      <View style={s.card}>
        <Text style={s.desc}>{description}</Text>
      </View>

      {tags.length > 0 && (
        <View style={s.tagsWrap}>
          {tags.map((t, i) => (
            <View key={i} style={s.tag}>
              <Text style={s.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      {url && (
        <Pressable style={s.btn} onPress={openUrl}>
          <Text style={s.btnText}>Abrir conteúdo</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b0f1a" },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#e7ecff",
  },

  meta: {
    color: "#9aa6c3",
    marginTop: 6,
  },

  card: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.10)",
    backgroundColor: "rgba(255,255,255,.03)",
  },

  desc: {
    color: "#cbd5ff",
    lineHeight: 20,
  },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 8,
  },

  tag: {
    backgroundColor: "rgba(45,212,191,.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tagText: {
    color: "#2dd4bf",
    fontWeight: "700",
  },

  btn: {
    marginTop: 20,
    backgroundColor: "#2dd4bf",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#08101a",
    fontWeight: "900",
  },
});