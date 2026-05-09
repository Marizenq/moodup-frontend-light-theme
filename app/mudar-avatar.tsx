import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const AVATARS = [
  {
    id: "f1",
    uri: "https://api.dicebear.com/9.x/adventurer/png?seed=Alice&backgroundColor=b6e3f4",
  },
  {
    id: "f2",
    uri: "https://api.dicebear.com/9.x/adventurer/png?seed=Julia&backgroundColor=c0aede",
  },
  {
    id: "f3",
    uri: "https://api.dicebear.com/9.x/adventurer/png?seed=Maria&backgroundColor=ffd5dc",
  },
  {
    id: "m1",
    uri: "https://api.dicebear.com/9.x/adventurer/png?seed=Joao&backgroundColor=d1d4f9",
  },
  {
    id: "m2",
    uri: "https://api.dicebear.com/9.x/adventurer/png?seed=Carlos&backgroundColor=c0aede",
  },
  {
    id: "m3",
    uri: "https://api.dicebear.com/9.x/adventurer/png?seed=Lucas&backgroundColor=b6e3f4",
  },
];

export default function MudarAvatar() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  async function salvarAvatar() {
    await AsyncStorage.setItem("avatar_usuario", selectedAvatar.uri);
    router.replace("/(tabs)/perfil" as any);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha seu avatar</Text>

      <View style={styles.avatarGrid}>
        {AVATARS.map((avatar) => {
          const active = selectedAvatar.id === avatar.id;

          return (
            <Pressable
              key={avatar.id}
              style={[styles.avatarBox, active && styles.avatarActive]}
              onPress={() => setSelectedAvatar(avatar)}
            >
              <Image source={{ uri: avatar.uri }} style={styles.avatar} />
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.button} onPress={salvarAvatar}>
        <Text style={styles.buttonText}>Salvar avatar</Text>
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
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
  },

  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  avatarActive: {
    borderColor: "#2dd4bf",
    borderWidth: 3,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  button: {
    backgroundColor: "#2dd4bf",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#08101A",
    fontSize: 16,
    fontWeight: "900",
  },
});