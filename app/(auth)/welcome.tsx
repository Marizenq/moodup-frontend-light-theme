import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";

export default function Welcome() {
  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.hero}>
        <Text style={s.logo}>MoodUp</Text>

        <View style={s.badge}>
          <Text style={s.badgeText}>Apoio emocional diário</Text>
        </View>

        <Text style={s.slogan}>
          Seu espaço de apoio emocional, autocuidado e acompanhamento diário.
        </Text>

        <Text style={s.subtitle}>
          Registre seu humor, acompanhe sua evolução e receba apoio nos momentos
          mais difíceis de forma simples, acolhedora e organizada.
        </Text>
      </View>

      <View style={s.actions}>
        <Link href="/(auth)/login" asChild>
          <Pressable style={s.btnPrimary}>
            <Text style={s.btnPrimaryText}>Entrar</Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/cadastro?fresh=1" asChild>
          <Pressable style={s.btnSecondary}>
            <Text style={s.btnSecondaryText}>Criar conta</Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/esqueci-senha" style={s.link}>
          Esqueci minha senha
        </Link>
      </View>

      <View style={s.footerBox}>
        <Text style={s.footerTitle}>Importante</Text>
        <Text style={s.footerText}>
          O MoodUp é um aplicativo de apoio emocional. Não substitui atendimento
          médico, psicológico ou psiquiátrico.
        </Text>

        <Text style={s.footerTextSecondary}>
          Em situações de crise ou urgência emocional, procure ajuda
          especializada.
        </Text>
      </View>

      <Text style={s.termsHint}>
        Ao continuar, você poderá visualizar e aceitar os termos de uso do
        aplicativo.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },

  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "space-between",
  },

  hero: {
    marginTop: 50,
  },

  logo: {
    color: "#E5E7EB",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: "rgba(45,212,191,0.14)",
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.28)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  badgeText: {
    color: "#2dd4bf",
    fontSize: 12,
    fontWeight: "700",
  },

  slogan: {
    color: "#2dd4bf",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 18,
    lineHeight: 30,
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 15,
    marginTop: 14,
    lineHeight: 24,
  },

  actions: {
    gap: 12,
    marginTop: 28,
  },

  btnPrimary: {
    backgroundColor: "#6d5efc",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  btnSecondary: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.14)",
    backgroundColor: "rgba(255,255,255,.03)",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  btnSecondaryText: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "800",
  },

  link: {
    color: "#E5E7EB",
    opacity: 0.9,
    marginTop: 8,
    textAlign: "center",
  },

  footerBox: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.08)",
    backgroundColor: "rgba(255,255,255,.03)",
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
  },

  footerTitle: {
    color: "#E5E7EB",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 8,
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },

  footerTextSecondary: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  termsHint: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
});