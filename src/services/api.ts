import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: "https://moodup-v1-3.onrender.com/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =========================
// 🎯 MÉTODOS PARA MOODS
// =========================
export const moodApi = {
  // Buscar todos os moods
  getAll: () => api.get("/moods"),
  
  // Atualizar mood
  update: (id: number, data: { level?: number; note?: string; trigger_ids?: number[] }) => 
    api.put(`/moods/${id}`, data),
  
  // Deletar mood
  delete: (id: number) => 
    api.delete(`/moods/${id}`),

  // 🔥 ADICIONADO: Buscar todos os triggers disponíveis
  getTriggers: () => api.get("/triggers"),

   // 🔥 ADICIONADO: Resumo semanal (para o gráfico)
  getWeeklySummary: () => api.get("/moods/summary/weekly"),
  
  // 🔥 ADICIONADO: Insights semanais
  getWeeklyInsights: () => api.get("/moods/insights/weekly"),
};

export default api;