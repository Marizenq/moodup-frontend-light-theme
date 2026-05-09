import { useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet, View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    console.log("✅ TELA MOODS CARREGADA COM SUCESSO!");
    Alert.alert("Sucesso", "Você está dentro do app!");
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/imagem_moodup.jpeg")}
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.content}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>MoodUp</Text>
          <Text style={styles.subtitle}>Seu diário de apoio emocional</Text>
          
          <View style={styles.messageBox}>
            <Text style={styles.bigText}>
              Aqui você pode pausar, refletir e cuidar do que sente.
            </Text>
            <Text style={styles.description}>
              Registre seus humores, acompanhe sua evolução ao longo do tempo 
              e encontre apoio nos momentos mais difíceis.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },

  image: {
    width: "100%",
    height: 320,
  },

  content: {
    flex: 1,
    padding: 24,
    marginTop: -40,
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#E5E7EB",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    color: "#2dd4bf",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
  },

  messageBox: {
    backgroundColor: "rgba(45, 212, 191, 0.08)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.15)",
  },

  bigText: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 16,
    textAlign: "center",
  },

  description: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});