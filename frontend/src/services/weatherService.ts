import type { IWeatherLog } from "@/types/weather";

export async function getWeatherLogs(): Promise<IWeatherLog[]> {
  const response = await fetch("http://localhost:3000/api/weather/logs");
  return response.json();
}
