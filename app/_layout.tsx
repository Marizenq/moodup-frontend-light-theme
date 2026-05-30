import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemePreferenceProvider } from "@/theme/theme-preference";

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutWithTheme />
    </ThemePreferenceProvider>
  );
}

function RootLayoutWithTheme() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Home (app/index.tsx) */}
        <Stack.Screen name="index" />

        {/* Grupos */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />

        {/* Telas individuais */}
        <Stack.Screen name="relatorios" options={{ title: 'Relatórios', headerShown: true }} />

        {/* Modal */}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
