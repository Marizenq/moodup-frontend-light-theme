import { api } from "@/services/api"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";

const LOCAL_TERMS_KEY = "accepted_terms_local";
const TOKEN_KEY = "token";
const REGISTER_DRAFT_KEY = "register_draft";

export default function Terms() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (redirecting) {
      console.log("Redirecionando...");
    }
  }, [redirecting]);

  async function aceitar() {
    if (redirecting) return;
    
    try {
      setLoading(true);

      // FLUXO CADASTRO DIRETO
      if (mode === "cadastro") {
        const draftRaw = await AsyncStorage.getItem(REGISTER_DRAFT_KEY);

        if (!draftRaw) {
          Alert.alert("Erro", "Dados do cadastro não encontrados.");
          setLoading(false);
          return;
        }

        const draft = JSON.parse(draftRaw);

        if (!draft.name || !draft.email || !draft.password) {
          Alert.alert("Erro", "Dados incompletos. Por favor, tente novamente.");
          setLoading(false);
          return;
        }

        console.log("Enviando dados para cadastro...");

        const res = await api.post("/auth/register", {
          name: draft.name,
          email: draft.email,
          password: draft.password,
          password_confirmation: draft.password_confirmation,
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
        });

        console.log("Cadastro realizado com sucesso!");

        const token = res.data?.token ?? res.data?.access_token ?? null;

        if (!token) {
          Alert.alert("Erro", "Cadastro feito, mas não foi possível autenticar.");
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(LOCAL_TERMS_KEY, new Date().toISOString());
        await AsyncStorage.removeItem(REGISTER_DRAFT_KEY);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        console.log("Token salvo, redirecionando...");
        setRedirecting(true);
        setLoading(false);

        // 🔥 REDIRECIONAMENTO CORRIGIDO
        router.replace("/(tabs)" as any);
        
        return;
      }

      // USUÁRIO JÁ LOGADO
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        Alert.alert("Erro", "Sessão não encontrada. Faça login novamente.");
        router.replace("/(auth)/login");
        return;
      }

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      await api.post("/auth/accept-terms", {
        accepted_at: new Date().toISOString(),
        terms_version: "1.0.0",
      });

      await AsyncStorage.setItem(LOCAL_TERMS_KEY, new Date().toISOString());

      console.log("Redirecionando...");
      setRedirecting(true);
      setLoading(false);

      // 🔥 REDIRECIONAMENTO CORRIGIDO
      router.replace("/(tabs)" as any);
      
    } catch (error: any) {
      console.error("Erro ao aceitar termos:", error);
      
      let errorMessage = "Não foi possível concluir a operação.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Erro", errorMessage);
      setLoading(false);
    }
  }

  function voltar() {
    if (mode === "cadastro") {
      router.replace("/(auth)/cadastro");
      return;
    }
    router.replace("/(auth)/login");
  }

  // Tela de redirecionamento
  if (redirecting) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#6d5efc" />
          <Text style={styles.redirectText}>Redirecionando para o app...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.card}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Termos de Uso e Política de Privacidade</Text>

        <Text style={styles.text}>
          O MoodUp é um aplicativo de apoio emocional e autocuidado desenvolvido 
          para auxiliar no monitoramento do bem-estar e na promoção de hábitos saudáveis.
        </Text>

        <Text style={styles.sectionTitle}>1. Natureza do Serviço</Text>
        <Text style={styles.text}>
          O MoodUp não é uma ferramenta de diagnóstico médico, não prescreve 
          medicamentos, tratamentos ou terapias. Todas as informações fornecidas 
          são exclusivamente para fins informativos e de autocuidado.
        </Text>

        <Text style={styles.sectionTitle}>2. Responsabilidade do Usuário</Text>
        <Text style={styles.text}>
          Ao utilizar o MoodUp, você declara estar ciente e concordar que:
        </Text>
        <Text style={styles.bullet}>
          • O aplicativo NÃO substitui acompanhamento médico, psicológico ou psiquiátrico;
        </Text>
        <Text style={styles.bullet}>
          • Recomendações geradas são baseadas em algoritmos e não consideram 
          seu histórico clínico completo;
        </Text>
        <Text style={styles.bullet}>
          • Em caso de crise emocional, ideação suicida ou qualquer emergência, 
          você deve buscar ajuda profissional IMEDIATAMENTE;
        </Text>
        <Text style={styles.bullet}>
          • Você é o único responsável por suas decisões baseadas no conteúdo do app;
        </Text>
        <Text style={styles.bullet}>
          • Seus dados serão tratados com confidencialidade conforme nossa 
          Política de Privacidade.
        </Text>

        <Text style={styles.sectionTitle}>3. Privacidade e Dados</Text>
        <Text style={styles.text}>
          Coletamos informações sobre seu humor e atividades para personalizar 
          sua experiência. Seus dados são criptografados e nunca serão vendidos 
          a terceiros. Você pode solicitar a exclusão dos seus dados a qualquer momento.
        </Text>

        <Text style={styles.sectionTitle}>4. Atualizações dos Termos</Text>
        <Text style={styles.text}>
          Podemos atualizar estes termos periodicamente. Notificaremos você sobre 
          mudanças significativas. O uso continuado do app após alterações 
          constitui aceitação dos novos termos.
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Atenção: Situações de Emergência</Text>
          <Text style={styles.warningText}>
            Em caso de crise, pensamentos suicidas ou qualquer emergência emocional:
          {'\n\n'}
            • Ligue 188 - Centro de Valorização da Vida (CVV){'\n'}
            • Ligue 192 - SAMU (emergências médicas){'\n'}
            • Procure o CAPS mais próximo{'\n'}
            • Busque atendimento no pronto-socorro mais próximo
          </Text>
        </View>

        <Text style={styles.consentText}>
          Ao clicar em "Aceitar e continuar", você confirma que leu, entendeu 
          e concorda com todos os Termos de Uso e Política de Privacidade.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={aceitar}
          disabled={loading || redirecting}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Aceitar e continuar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={voltar}
          disabled={loading || redirecting}
        >
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#0B0F19", padding: 20, justifyContent: "center", }, card: { backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#1F2937", borderRadius: 16, padding: 18, }, title: { color: "#E5E7EB", fontSize: 24, fontWeight: "700", marginBottom: 14, }, sectionTitle: { color: "#E5E7EB", fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 8, }, text: { color: "#CBD5E1", fontSize: 14, lineHeight: 22, marginTop: 6, }, bullet: { color: "#CBD5E1", fontSize: 14, lineHeight: 22, marginTop: 6, paddingLeft: 8, }, warningBox: { marginTop: 20, backgroundColor: "rgba(220, 38, 38, 0.1)", borderColor: "rgba(220, 38, 38, 0.3)", borderWidth: 1, borderRadius: 14, padding: 14, }, warningTitle: { color: "#EF4444", fontWeight: "800", marginBottom: 8, fontSize: 14, }, warningText: { color: "#E5E7EB", lineHeight: 21, fontSize: 13, }, consentText: { color: "#9CA3AF", fontSize: 12, lineHeight: 18, marginTop: 20, marginBottom: 10, fontStyle: "italic", textAlign: "center", }, button: { marginTop: 22, backgroundColor: "#E91E63", paddingVertical: 14, borderRadius: 12, alignItems: "center", }, buttonText: { color: "#fff", fontWeight: "700", fontSize: 15, }, secondaryButton: { marginTop: 12, borderWidth: 1, borderColor: "rgba(255,255,255,.12)", paddingVertical: 14, borderRadius: 12, alignItems: "center", }, secondaryButtonText: { color: "#E5E7EB", fontWeight: "700", fontSize: 15, }, redirectText: { color: "#E5E7EB", textAlign: "center", marginTop: 20, fontSize: 16, }, });