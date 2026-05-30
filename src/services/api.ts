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

   // 🔥 ADICIONAR ESTES MÉTODOS:
  getTopTriggers: (days: number = 30, limit: number = 5) => 
    api.get(`/stats/top-triggers?days=${days}&limit=${limit}`),
  
  getStatsOverview: (days: number = 30) => 
    api.get(`/stats/overview?days=${days}`),
  
  getTopResources: (days: number = 30, limit: number = 5) => 
    api.get(`/stats/top-resources?days=${days}&limit=${limit}`),
};

export default api;