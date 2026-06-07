import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function InformacoesPessoais() {
  const [dados, setDados] = useState("Carregando...");

  useEffect(() => {
    async function carregarDados() {
      const userSalvo = await AsyncStorage.getItem("user");

      setDados(userSalvo || "NADA ENCONTRADO");
    }

    carregarDados();
  }, []);

  return (
    <View>
      <Text>Informações pessoais</Text>
      <Text>{dados}</Text>
    </View>
  );
}