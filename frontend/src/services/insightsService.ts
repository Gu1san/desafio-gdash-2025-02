import api from "./api";

export async function fetchInsights() {
  const response = await api.get("/weather/insights");

  return response.data;
}

export async function regenerateInsights() {
  const response = await api.post("/weather/insights");
  return response.data;
}
