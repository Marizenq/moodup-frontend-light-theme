import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemePreference } from "@/theme/theme-preference";
import { useThemeColor } from "@/hooks/use-theme-color";
export default function Preferencias() {
  const { preference, setPreference } = useThemePreference();
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {" "}
      <Text style={[styles.title, { color: text }]}>Preferências</Text>
      <Text
        style={[
          styles.subtitle,
          background === "#020817" ? {} : { color: "#64748B" },
        ]}
      >
        Tema do aplicativo
      </Text>
      <Pressable
        style={[
          styles.option,
          background === "#020817"
            ? {}
            : {
                backgroundColor: "#95d4f1",
                borderColor: "#C5D3DA",
                borderWidth: 1,
              },
          preference === "dark" && styles.selected,
        ]}
        onPress={() => setPreference("dark")}
      >
        <Text style={styles.optionText}>
          {preference === "dark" ? "◉" : "○"} 🌙 Tema Escuro (padrão)
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.option,
          background === "#020817"
            ? {}
            : {
                backgroundColor: "#95d4f1",
                borderColor: "#C5D3DA",
                borderWidth: 1,
              },
          preference === "light" && styles.selected,
        ]}  onPress={() => setPreference("light")}
>
      
        <Text style={styles.optionText}>
          {preference === "light" ? "◉" : "○"} ☀️ Tema Claro
        </Text>
      </Pressable>
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
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 16,
  },

  option: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#111827",
    marginBottom: 12,
  },

  selected: {
    borderWidth: 2,
    borderColor: "#2DD4BF",
  },

  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
