
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2dd4bf",
        tabBarStyle: { backgroundColor: "#0B0F19", borderTopColor: "rgba(255,255,255,.08)" },
        headerStyle: { backgroundColor: "#0B0F19" },
        headerTintColor: "#E5E7EB",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Criar Mood",
          tabBarLabel: "Criar",
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="ajuda"
        options={{
          title: "Auxílio",
          tabBarLabel: "Auxílio",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="sugestoes"
        options={{
          title: "Conversa",
          tabBarLabel: "Conversa",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}