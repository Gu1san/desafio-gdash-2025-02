import { Card } from "@/components/ui/card";
import { formatDay } from "@/lib/utils";
import type { IWeatherCurrent } from "@/types/weather";

interface WeatherMainCardProps {
  current: IWeatherCurrent;
  location?: string; // opcional
}

export default function CurrentWeatherCard({
  current,
  location,
}: WeatherMainCardProps) {
  return (
    <Card
      className="
        px-6 py-6 rounded-3xl
        bg-white/80 dark:bg-neutral-900/80
        backdrop-blur-md
        border border-neutral-200 dark:border-neutral-700
        shadow-lg
      "
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left Side */}
        <div className="flex flex-col gap-2">
          {/* Localização */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full 
            bg-green-600 text-white text-sm font-medium w-fit"
          >
            {/* Ícone futuro */}
            <span>📍</span>
            <span>{location ?? "Local"}</span>
          </div>

          {/* Dia + Data */}
          <div>
            <h2 className="text-3xl font-semibold">
              {formatDay(current.timestamp)}
            </h2>
            <p className="text-sm opacity-70">
              {new Date(current.timestamp * 1000).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {/* Temperatura */}
          <div className="mt-4">
            <span className="text-6xl font-bold">{current.temperature}°C</span>

            <p className="text-sm mt-1 opacity-75">
              Sensação: {current.apparent_temperature}°C
            </p>
          </div>

          {/* Condição */}
          <div className="flex items-center gap-2 mt-4">
            {/* Placeholder do ícone */}
            <span className="text-3xl">⛅</span>
            <p className="text-lg font-medium">{current.weather_description}</p>
          </div>
        </div>

        {/* Right Side — Ícone grande */}
        <div className="flex flex-col items-center justify-center mt-auto md:mt-0">
          {/* Ícone gigante (placeholder até você ter ícones reais) */}
          <div className="text-7xl md:text-8xl">🌤️</div>

          {/* Vento / Umidade */}
          <div className="mt-4 text-center opacity-80">
            <p>Umidade: {current.humidity}%</p>
            <p>Vento: {current.wind_speed} km/h</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
