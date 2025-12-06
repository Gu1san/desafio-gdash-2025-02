import type { IWeatherLog } from "@/types/weather";
import api from "./api";

export async function getWeatherLogs(): Promise<IWeatherLog> {
  const response = await api.get<IWeatherLog>("/weather/logs");
  return response.data;
}

export async function exportWeatherData(format: "xlsx" | "csv"): Promise<Blob> {
  const response = await api.get(`/weather/export.${format}`, {
    responseType: "blob",
  });
  return response.data;
}
