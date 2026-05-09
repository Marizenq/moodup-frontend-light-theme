import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Mood = {
  created_at: string;
  level: number;
};

type Props = {
  data: Mood[];
  onPressDay?: (item: Mood) => void;
};

export default function MoodCalendar({ data = [], onPressDay }: Props) {
  // 🔢 últimos 30 dias
  const days = Array.from({ length: 30 });

  function getColor(level?: number) {
    if (!level) return "#1f2937"; // vazio
    if (level <= 2) return "#ef4444"; // ruim
    if (level === 3) return "#f59e0b"; // ok
    return "#22c55e"; // bom
  }

  function findMoodByIndex(index: number) {
    if (!Array.isArray(data)) return undefined;
    return data[index];
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {days.map((_, index) => {
          const mood = findMoodByIndex(index);

          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 15)}
            >
              <TouchableOpacity
                style={[
                  styles.day,
                  { backgroundColor: getColor(mood?.level) },
                ]}
                onPress={() => mood && onPressDay?.(mood)}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  day: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
});