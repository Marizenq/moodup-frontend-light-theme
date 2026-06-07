import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Perfil() {
  const router = useRouter();
  const background = useThemeColor({}, "background");
  const card = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const border = useThemeColor({}, "border");
  const primary = useThemeColor({}, "primary");
  const danger = useThemeColor({}, "danger");
  const colorScheme = useColorScheme();

  const [nome, setNome] = useState("Usuário");
  const [showModal, setShowModal] = useState(false);

  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/9.x/adventurer/png?seed=Ana&backgroundColor=b6e3f4",
  );

  async function sair() {
    await AsyncStorage.clear();
    setShowModal(false);
    router.replace("/(auth)/login" as any);
  }

  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        const avatarSalvo = await AsyncStorage.getItem("avatar_usuario");
        if (avatarSalvo) setAvatar(avatarSalvo);

        const userSalvo = await AsyncStorage.getItem("user");
        if (userSalvo) {
          const user = JSON.parse(userSalvo);
          setNome(user.name || user.nome || "Usuário");
        }
      }

      carregarDados();
    }, []),
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: card,
            borderColor: border,
          },
        ]}
      >
        <View style={styles.avatarBox}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </View>

        <Text style={[styles.name, { color: text }]}>Olá, {nome} 👋</Text>

        <Pressable onPress={() => router.push("/mudar-avatar" as any)}>
          <Text style={[styles.changeAvatar, { color: primary }]}>
            Mudar avatar
          </Text>
        </Pressable>
      </View>
      <View style={styles.menu}>
        <MenuItem
          icon="person-outline"
          label="Conta"
          onPress={() => router.push("/conta" as any)}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notificações"
          onPress={() => router.push("/notificacoes" as any)}
        />
        <MenuItem
          icon="star-outline"
          label="Feedback e avaliação"
          onPress={() => router.push("/feedback" as any)}
        />
        <MenuItem
          icon="settings-outline"
          label="Preferências"
          onPress={() => router.push("/preferencias" as any)}
        />

        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [
            styles.item,
            colorScheme === "light"
              ? {
                  backgroundColor: card,
                  borderColor: danger,
                  borderWidth: 1,
                }
              : styles.logout,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.itemLeft}>
            <Ionicons name="log-out-outline" size={22} color={danger} />
            <Text
              style={[
                styles.logoutText,
                colorScheme === "light" && { color: danger },
              ]}
            >
              Sair
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </Pressable>
      </View>
      <Modal transparent animationType="fade" visible={showModal}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={styles.modalText}>Tem certeza que deseja sair?</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.cancel]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.confirm]}
                onPress={sair}
              >
                <Text style={styles.confirmText}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: any) {
  const card = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "border");
  const primary = useThemeColor({}, "primary");
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: card,
          borderColor: border,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={primary} />
        <Text style={[styles.itemText, { color: text }]}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    padding: 20,
  },

  headerCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 24,
  },

  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1C2333",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#2dd4bf",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  name: {
    color: "#E5E7EB",
    fontSize: 22,
    fontWeight: "800",
  },

  changeAvatar: {
    color: "#2dd4bf",
    marginTop: 8,
    fontWeight: "800",
  },

  menu: {
    gap: 12,
  },

  item: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  itemText: {
    color: "#E5E7EB",
    fontSize: 16,
    fontWeight: "700",
  },

  logout: {
    marginTop: 8,
    borderColor: "rgba(239,68,68,.35)",
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "800",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1F2937",
  },

  modalTitle: {
    color: "#E5E7EB",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  modalText: {
    color: "#94A3B8",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  cancel: {
    backgroundColor: "#1F2937",
  },

  confirm: {
    backgroundColor: "#EF4444",
  },

  cancelText: {
    color: "#E5E7EB",
    fontWeight: "700",
  },

  confirmText: {
    color: "#fff",
    fontWeight: "800",
  },
});
