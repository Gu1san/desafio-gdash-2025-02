import type { IWeatherForecastResponse, IWeatherHour } from "@/types/weather";
import { fetchWeatherApi } from "openmeteo";

export async function fetchWeatherForecast(): Promise<IWeatherForecastResponse> {
  const params = {
    latitude: -19.9208,
    longitude: -43.9378,
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "cloud_cover",
      "precipitation",
      "apparent_temperature",
    ],
    timezone: "America/Sao_Paulo",
    forecast_days: 1,
  };

  const url = "https://api.open-meteo.com/v1/forecast";

  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  // Info de localização
  const latitude = response.latitude();
  const longitude = response.longitude();

  const hourly = response.hourly();

  if (!hourly) {
    throw new Error("Hourly data is not available in the response");
  }

  const utcOffsetSeconds = response.utcOffsetSeconds();

  // Construir timestamps
  const timeStart = Number(hourly.time());
  const timeEnd = Number(hourly.timeEnd());
  const interval = hourly.interval();

  const hoursCount = (timeEnd - timeStart) / interval;

  const timestamps = Array.from({ length: hoursCount }, (_, i) =>
    Math.floor((timeStart + i * interval + utcOffsetSeconds) * 1000)
  ).map((ms) => Math.floor(ms / 1000)); // -> segundos UNIX

  // Variáveis ( seguem o mesmo índice da URL )
  const temps = hourly.variables(0)?.valuesArray();
  const humidity = hourly.variables(1)?.valuesArray();
  const wind = hourly.variables(2)?.valuesArray();
  const cloud = hourly.variables(3)?.valuesArray();
  const precipitation = hourly.variables(4)?.valuesArray();
  const apparent = hourly.variables(5)?.valuesArray();

  if (!temps || !humidity || !wind || !cloud || !precipitation || !apparent) {
    throw new Error(
      "One or more hourly variables are not available in the response"
    );
  }

  // Montar array de horas
  const hours: IWeatherHour[] = timestamps.map((ts, i) => ({
    timestamp: ts,
    temperature: temps[i],
    humidity: humidity[i],
    wind_speed: wind[i],
    cloud_cover: cloud[i],
    precipitation: precipitation[i],
    apparent_temperature: apparent[i],
  }));

  return {
    city: "Belo Horizonte",
    latitude,
    longitude,
    hours,
  };
}
