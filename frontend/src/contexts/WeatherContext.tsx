import React, { createContext, useContext, useState } from "react";
import type {
  IWeatherCurrent,
  IWeatherDay,
  IWeatherHour,
  IWeatherLog,
} from "@/types/weather";
import { exportWeatherData, getWeatherLogs } from "@/services/weatherService";

interface WeatherContextData {
  logs: IWeatherLog;
  current: IWeatherCurrent;
  hourly: IWeatherHour[];
  daily: IWeatherDay[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  exportData: (format: "xlsx" | "csv") => Promise<void>;
}

const WeatherContext = createContext<WeatherContextData>(
  {} as WeatherContextData
);

export const WeatherProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [logs, setLogs] = useState<IWeatherLog>({} as IWeatherLog);
  const [current, setCurrent] = useState<IWeatherCurrent>(
    {} as IWeatherCurrent
  );
  const [hourly, setHourly] = useState<IWeatherHour[]>([]);
  const [daily, setDaily] = useState<IWeatherDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    const data = await getWeatherLogs();

    const normalizedCurrent = {
      ...data.current,
      temperature: round(data.current.temperature),
      humidity: round(data.current.humidity),
      apparent_temperature: round(data.current.apparent_temperature),
      wind_speed: round(data.current.wind_speed),
    };

    const normalizedHourly = data.hourly.map((item) => ({
      ...item,
      temperature: round(item.temperature),
      humidity: round(item.humidity),
      precipitation: round(item.precipitation),
      cloud_cover: round(item.cloud_cover),
      wind_speed: round(item.wind_speed),
    }));

    const normalizedDaily = data.daily.map((item) => ({
      ...item,
      temp_max: round(item.temp_max),
      temp_min: round(item.temp_min),
    }));

    setLogs(data);
    setCurrent(normalizedCurrent);
    setHourly(normalizedHourly);
    setDaily(normalizedDaily);

    setIsLoading(false);
  };

  function round(n: number) {
    return Number(n.toFixed(1));
  }

  const exportData = async (format: "xlsx" | "csv") => {
    try {
      const blob = await exportWeatherData(format);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `weather-data.${format}`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  return (
    <WeatherContext.Provider
      value={{ logs, current, hourly, daily, isLoading, refresh, exportData }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used inside a WeatherProvider");
  }
  return context;
}
