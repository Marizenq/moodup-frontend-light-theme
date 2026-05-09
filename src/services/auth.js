import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const TOKEN_KEY = "moodup_token";

export async function setToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function loadToken() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return token;
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common.Authorization;
}