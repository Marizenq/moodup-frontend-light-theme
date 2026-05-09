import { api } from "@/services/api";

function normalizeTrigger(trigger: string) {
  const key = trigger?.toLowerCase().trim();

  if (key === "família") return "familia";
  if (key === "saúde") return "saude";
  if (key === "trânsito") return "transito";
  if (key === "faculdade" || key === "escola/faculdade") return "escola";

  return key;
}

export async function fetchSubTriggers(trigger: string) {
  try {
    const key = normalizeTrigger(trigger);

    console.log("TRIGGER ENVIADO PRO BACK:", key);

    const response = await api.get(`/sub-triggers?trigger=${key}`);

    console.log("SUBTRIGGERS RECEBIDOS:", response.data);

    return response.data?.data || response.data || [];
  } catch (error: any) {
    console.log("ERRO AO BUSCAR SUBTRIGGERS:", error?.response?.data || error);
    return [];
  }
}