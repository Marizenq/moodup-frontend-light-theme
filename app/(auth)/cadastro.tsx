import React, { useState, useCallback, useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import {
  Link,
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/services/api";
import { Ionicons } from "@expo/vector-icons";
import ReactNativeSelect from '@tenkaipl/react-native-select';

const TOKEN_KEY = "token";
const LOCAL_TERMS_KEY = "accepted_terms_local";
const REGISTER_DRAFT_KEY = "register_draft";

function firstLaravelError(data: any) {
  const errs = data?.errors;
  if (!errs || typeof errs !== "object") return null;

  const firstKey = Object.keys(errs)[0];
  const firstMsg = Array.isArray(errs[firstKey]) ? errs[firstKey][0] : null;
  return firstMsg || null;
}

function getAllLaravelErrors(data: any) {
  const errs = data?.errors;
  if (!errs || typeof errs !== "object") return [];
  
  const allErrors: string[] = [];
  Object.keys(errs).forEach(key => {
    if (Array.isArray(errs[key])) {
      allErrors.push(...errs[key]);
    }
  });
  return allErrors;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ESTADOS = [
  { label: "Selecione seu estado", value: "" },
  { label: "Acre", value: "AC" },
  { label: "Alagoas", value: "AL" },
  { label: "Amapá", value: "AP" },
  { label: "Amazonas", value: "AM" },
  { label: "Bahia", value: "BA" },
  { label: "Ceará", value: "CE" },
  { label: "Distrito Federal", value: "DF" },
  { label: "Espírito Santo", value: "ES" },
  { label: "Goiás", value: "GO" },
  { label: "Maranhão", value: "MA" },
  { label: "Mato Grosso", value: "MT" },
  { label: "Mato Grosso do Sul", value: "MS" },
  { label: "Minas Gerais", value: "MG" },
  { label: "Pará", value: "PA" },
  { label: "Paraíba", value: "PB" },
  { label: "Paraná", value: "PR" },
  { label: "Pernambuco", value: "PE" },
  { label: "Piauí", value: "PI" },
  { label: "Rio de Janeiro", value: "RJ" },
  { label: "Rio Grande do Norte", value: "RN" },
  { label: "Rio Grande do Sul", value: "RS" },
  { label: "Rondônia", value: "RO" },
  { label: "Roraima", value: "RR" },
  { label: "Santa Catarina", value: "SC" },
  { label: "São Paulo", value: "SP" },
  { label: "Sergipe", value: "SE" },
  { label: "Tocantins", value: "TO" },
  { label: "Prefiro não responder", value: "PREFIRO_NAO_RESPONDER" },
];

// Opções para os selects
const SEXO_OPTIONS = [
  { label: "Feminino", value: "feminino" },
  { label: "Masculino", value: "masculino" },
  { label: "Outro", value: "outro" },
];

const FAIXA_ETARIA_OPTIONS = [
  { label: "Selecione sua faixa etária", value: "" },
  { label: "14–17 anos", value: "14-17" },
  { label: "18–24 anos", value: "18-24" },
  { label: "25–34 anos", value: "25-34" },
  { label: "35–44 anos", value: "35-44" },
  { label: "45–54 anos", value: "45-54" },
  { label: "55–64 anos", value: "55-64" },
  { label: "65–70 anos", value: "65-70" },
  { label: "Prefiro não responder", value: "nao_informado" },
];

const ESTADO_OPTIONS = ESTADOS.map(e => ({
  label: e.label,
  value: e.value,
}));

// Interface para as props do CustomSelect
interface CustomSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (item: { label: string; value: string }) => void;
  placeholder: string;
  error?: string;
  disabled?: boolean;
}

// Componente Customizado para os Selects - CORRETO para ReactNativeSelect
function CustomSelect({ options, value, onChange, placeholder, error, disabled }: CustomSelectProps) {
  return (
    <ReactNativeSelect
      options={options}
      value={value || ""}
      onChange={(item) => {
        console.log("🎯 Select mudou:", item);
        onChange(item);  // ← item já é { label, value }
      }}
      placeholder={placeholder}
      disabled={disabled}
      theme="dark"
      colors={{
        primary: "#0B1220",
        colorTextPrimary: "#E5E7EB",
        colorTextSecondary: "#6B7280",
        border: error ? "#ff6b6b" : "#243041",
        secondary: "#94A3B8",
        selected: "#2dd4bf",
      }}
      triggerStyle={{
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 0,
        paddingHorizontal: 14,
        height: 48,
        justifyContent: 'center',
      }}
      dropdownStyle={{
        borderRadius: 12,
        marginTop: 4,
        backgroundColor: "#0F172A",
      }}
      itemStyle={{
        paddingVertical: 10,
        paddingHorizontal: 14,
      }}
    />
  );
}
export default function Cadastro() {
  const router = useRouter();
  const { fresh } = useLocalSearchParams<{ fresh?: string }>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [sexo, setSexo] = useState("");
  const [faixaEtaria, setFaixaEtaria] = useState('');
  const [estado, setEstado] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useFocusEffect(
    useCallback(() => {
      async function prepareData() {
        if (fresh === "1") {
          await AsyncStorage.removeItem(LOCAL_TERMS_KEY);
          await AsyncStorage.removeItem(REGISTER_DRAFT_KEY);
          setAcceptedTerms(false);
          setName("");
          setEmail("");
          setPassword("");
          setPasswordConfirmation("");
          setSexo("");
          setFaixaEtaria("");
          setEstado("");
          setFieldErrors({});
          return;
        }

        const accepted = await AsyncStorage.getItem(LOCAL_TERMS_KEY);
        setAcceptedTerms(accepted === "true");
        
        const draft = await AsyncStorage.getItem(REGISTER_DRAFT_KEY);
        if (draft) {
          try {
            const draftData = JSON.parse(draft);
            if (draftData.name) setName(draftData.name);
            if (draftData.email) setEmail(draftData.email);
            if (draftData.password) setPassword(draftData.password);
            if (draftData.password_confirmation) setPasswordConfirmation(draftData.password_confirmation);
            if (draftData.sexo) setSexo(draftData.sexo);
            if (draftData.faixaEtaria) setFaixaEtaria(draftData.faixaEtaria);
            if (draftData.estado) setEstado(draftData.estado);
          } catch (error) {
            console.error("Erro ao carregar rascunho:", error);
          }
        }
      }

      prepareData();
    }, [fresh]),
  );

  async function handleCadastro() {
    setErro("");
    setFieldErrors({});

    const nameClean = name.trim();
    const emailClean = email.trim().toLowerCase();
    const passClean = password.trim();
    const passConfClean = passwordConfirmation.trim();

    // DEBUG: Log dos valores antes de enviar
    console.log("📝 Valores do formulário:");
    console.log("Nome:", nameClean);
    console.log("Email:", emailClean);
    console.log("Sexo:", sexo);
    console.log("Faixa Etária:", faixaEtaria);
    console.log("Estado:", estado);
    console.log("Senha:", passClean ? "******" : "vazio");

    // Validações
    const newFieldErrors: {[key: string]: string} = {};
    
    if (!nameClean) newFieldErrors.name = "Informe seu nome.";
    if (!emailClean) newFieldErrors.email = "Informe seu email.";
    else if (!isValidEmail(emailClean)) newFieldErrors.email = "Email inválido.";
    if (!sexo) newFieldErrors.sexo = "Informe seu sexo.";
    if (!faixaEtaria) newFieldErrors.faixaEtaria = "Informe sua faixa etária.";
    if (!estado) newFieldErrors.estado = "Informe seu estado.";
    if (!passClean) newFieldErrors.password = "Informe uma senha.";
    else if (passClean.length < 8) newFieldErrors.password = "A senha deve ter pelo menos 8 caracteres.";
    if (!passConfClean) newFieldErrors.passwordConfirmation = "Confirme sua senha.";
    else if (passClean !== passConfClean) newFieldErrors.passwordConfirmation = "As senhas não conferem.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    const accepted = await AsyncStorage.getItem(LOCAL_TERMS_KEY);

    if (accepted !== "true") {
      await AsyncStorage.setItem(
        REGISTER_DRAFT_KEY,
        JSON.stringify({
          name: nameClean,
          email: emailClean,
          password: passClean,
          password_confirmation: passConfClean,
          sexo: sexo,
          faixaEtaria: faixaEtaria,
          estado: estado,
        })
      );

      router.push("/terms?mode=cadastro");
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        name: nameClean,
        email: emailClean,
        sexo: sexo,
        faixa_etaria: faixaEtaria,
        estado: estado,
        password: passClean,
        password_confirmation: passConfClean,
        accepted_terms: true,
      };

      console.log("🚀 Enviando requisição:", requestData);

      const res = await api.post("/auth/register", requestData);

      console.log("✅ Resposta:", res.data);

      const token =
        res.data?.token ??
        res.data?.access_token ??
        res.data?.data?.token ??
        null;

      if (token && typeof token === "string") {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.removeItem(LOCAL_TERMS_KEY);
        await AsyncStorage.removeItem(REGISTER_DRAFT_KEY);

        api.defaults.headers.common.Authorization = `Bearer ${token}`;

        router.replace("/(tabs)" as any);
        return;
      }

      router.replace("/(auth)/login");
    } catch (e: any) {
      console.log("❌ Erro completo:", e);
      console.log("❌ Response:", e?.response?.data);
      
      const allErrors = getAllLaravelErrors(e?.response?.data);
      
      if (allErrors.length > 0) {
        const errorMap: {[key: string]: string} = {};
        allErrors.forEach(err => {
          if (err.includes("email")) errorMap.email = err;
          else if (err.includes("password")) errorMap.password = err;
          else if (err.includes("name")) errorMap.name = err;
          else if (err.includes("sexo")) errorMap.sexo = err;
          else if (err.includes("faixa")) errorMap.faixaEtaria = err;
          else if (err.includes("estado")) errorMap.estado = err;
          else if (err.includes("termos")) errorMap.terms = err;
        });
        
        if (Object.keys(errorMap).length > 0) {
          setFieldErrors(errorMap);
          setErro("Por favor, corrija os erros abaixo.");
        } else {
          setErro(allErrors[0]);
        }
      } else {
        const msg =
          e?.response?.data?.message ||
          (typeof e?.response?.data === "string" ? e.response.data : null) ||
          e?.message ||
          "Não foi possível cadastrar.";
        setErro(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Cadastro</Text>
        <Text style={styles.subtitle}>Crie sua conta no MoodUp</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor="#6B7280"
          style={[styles.input, fieldErrors.name && styles.inputError]}
        />
        {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}

        <Text style={styles.label}>Email</Text>
        <View style={styles.emailContainer}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#6B7280"
            style={[styles.input, styles.emailInput, fieldErrors.email && styles.inputError]}
            editable={!loading}
          />
        </View>
        {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}

        <Text style={styles.label}>Sexo</Text>
        <CustomSelect
          options={SEXO_OPTIONS}
          value={sexo}
          onChange={(item) => {
            console.log("Sexo selecionado:", item.value);
            setSexo(item.value);
          }}
          placeholder="Selecione seu sexo"
          error={fieldErrors.sexo}
          disabled={loading}
        />
        {fieldErrors.sexo && <Text style={styles.fieldError}>{fieldErrors.sexo}</Text>}

        <Text style={styles.label}>Faixa etária</Text>
        <CustomSelect
          options={FAIXA_ETARIA_OPTIONS}
          value={faixaEtaria}
          onChange={(item) => {
            console.log("Faixa etária selecionada:", item.value);
            setFaixaEtaria(item.value);
          }}
          placeholder="Selecione sua faixa etária"
          error={fieldErrors.faixaEtaria}
          disabled={loading}
        />
        {fieldErrors.faixaEtaria && <Text style={styles.fieldError}>{fieldErrors.faixaEtaria}</Text>}

        <Text style={styles.label}>Estado</Text>
        <CustomSelect
          options={ESTADO_OPTIONS}
          value={estado}
          onChange={(item) => {
            console.log("Estado selecionado:", item.value);
            setEstado(item.value);
          }}
          placeholder="Selecione seu estado"
          error={fieldErrors.estado}
          disabled={loading}
        />
        {fieldErrors.estado && <Text style={styles.fieldError}>{fieldErrors.estado}</Text>}

        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="mínimo 8 caracteres"
            placeholderTextColor="#6B7280"
            style={[styles.input, styles.passwordInput, fieldErrors.password && styles.inputError]}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#94A3B8"
            />
          </Pressable>
        </View>
        {fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}

        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry={!showConfirmPassword}
            placeholder="repita a senha"
            placeholderTextColor="#6B7280"
            style={[styles.input, styles.passwordInput, fieldErrors.passwordConfirmation && styles.inputError]}
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={22}
              color="#94A3B8"
            />
          </Pressable>
        </View>
        {fieldErrors.passwordConfirmation && <Text style={styles.fieldError}>{fieldErrors.passwordConfirmation}</Text>}

        <Link
          href="/terms?mode=cadastro"
          style={[
            styles.linkCenter,
            acceptedTerms && { color: "#2dd4bf", fontWeight: "700" },
          ]}
        >
          {acceptedTerms ? "✔ Termos aceitos" : "Ler termos de uso"}
        </Link>

        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

        <Pressable
          onPress={() => handleCadastro()}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.85 },
            loading && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "CRIANDO..." : "CRIAR CONTA"}
          </Text>
        </Pressable>

        <Link href="/(auth)/login" style={styles.linkCenter}>
          Já tenho conta → Entrar
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0F172A",
    borderColor: "#1F2937",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  title: {
    color: "#E5E7EB",
    fontSize: 28,
    fontWeight: "700",
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
  inputError: {
    borderColor: "#ff6b6b",
    borderWidth: 1,
  },
  fieldError: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  errorText: {
    color: "#ff6b6b",
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
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
  linkCenter: {
    color: "#E5E7EB",
    opacity: 0.9,
    marginTop: 12,
    textAlign: "center",
  },
  emailContainer: {
    position: "relative",
  },
  emailInput: {
    paddingRight: 40,
  },
  emailIndicator: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});