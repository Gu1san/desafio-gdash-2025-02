import { Card } from "@/components/ui/card";
import { formatDay } from "@/lib/utils";
import type { IWeatherDay } from "@/types/weather";
import { ArrowDown, ArrowUp } from "lucide-react";
import WeatherIcon from "./WeatherIcon";

interface WeeklyForecastProps {
  daily: IWeatherDay[];
}

export default function WeeklyForecast({ daily }: WeeklyForecastProps) {
  return (
    <div className="weekly-grid">
      {daily.map((d) => (
        <Card key={d.timestamp} className="weekly-card">
          {/* Nome do dia */}
          <p className="weekly-day">{formatDay(d.timestamp)}</p>

          {/* Ícone */}
          <WeatherIcon code={d.weather_code} />

          {/* Temperaturas */}
          <div className="weekly-temps">
            <div className="weekly-max">
              <ArrowUp size={14} /> {d.temp_max}°
            </div>

            <div className="weekly-min">
              <ArrowDown size={14} /> {d.temp_min}°
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
