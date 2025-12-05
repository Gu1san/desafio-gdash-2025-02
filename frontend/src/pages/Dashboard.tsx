"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useWeather } from "@/contexts/WeatherContext";
import { useEffect } from "react";

export default function Dashboard() {
  const { current, hourly, daily, isLoading, refresh } = useWeather();

  useEffect(() => {
    refresh();
  }, []);

  if (isLoading || !current)
    return <p className="p-6">Carregando dados do clima...</p>;

  /* ============================
     FORMATADORES
  ============================ */
  const formatHour = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDay = (ts: number) =>
    new Date(ts * 1000).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  /* ============================
     PREPARAÇÃO DOS DADOS DO CHART
     (já tratados pelo useWeather, mas garantimos estrutura)
  ============================ */
  const hourlyChartData = hourly.map((h) => ({
    timestamp: h.timestamp,
    temperature: h.temperature,
    humidity: h.humidity,
    wind_speed: h.wind_speed,
    precipitation: h.precipitation,
    cloud_cover: h.cloud_cover,
  }));

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ============================
          INSIGHTS DE IA
      ============================ */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-2xl">Insights de IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* {insights ? (
            <>
              <p>
                <strong>Resumo:</strong> {insights.summary}
              </p>
              <p>
                <strong>Dia mais quente:</strong> {insights.hottestDay}
              </p>
              <p>
                <strong>Precipitação acumulada:</strong>{" "}
                {insights.precipitation}mm
              </p>
              <p>
                <strong>Tendência de temperatura:</strong> {insights.tempTrend}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Gerando insights...</p>
          )} */}
        </CardContent>
      </Card>

      {/* ============================
          CARD MAIOR — CURRENT WEATHER
      ============================ */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-xl">Clima Atual</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="Temperatura" value={`${current.temperature}°C`} />
          <Metric
            label="Sensação"
            value={`${current.apparent_temperature}°C`}
          />
          <Metric label="Umidade" value={`${current.humidity}%`} />
          <Metric label="Vento" value={`${current.wind_speed} km/h`} />
          <Metric label="Condição" value={current.weather_description} />
        </CardContent>
      </Card>

      {/* ============================
          MINI CARDS — 7 DIAS
      ============================ */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {daily.map((d) => (
          <Card key={d.timestamp} className="text-center py-4">
            <p className="font-semibold">{formatDay(d.timestamp)}</p>
            <p className="text-sm text-muted-foreground">
              {d.weather_description}
            </p>
            <p className="mt-2 text-lg">
              {d.temp_max}° / {d.temp_min}°
            </p>
          </Card>
        ))}
      </div>

      {/* ============================
          GRÁFICOS — HOURLY
      ============================ */}
      <ChartCard
        title="Temperatura (°C)"
        data={hourlyChartData}
        dataKey="temperature"
        format={formatHour}
      />

      <ChartCard
        title="Umidade (%)"
        data={hourlyChartData}
        dataKey="humidity"
        format={formatHour}
      />

      <ChartCard
        title="Vento (km/h)"
        data={hourlyChartData}
        dataKey="wind_speed"
        format={formatHour}
      />

      <ChartCard
        title="Chuva (mm)"
        data={hourlyChartData}
        dataKey="precipitation"
        format={formatHour}
      />

      <ChartCard
        title="Nuvens (%)"
        data={hourlyChartData}
        dataKey="cloud_cover"
        format={formatHour}
      />
    </div>
  );
}

/* ============================
    COMPONENTES
============================ */

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  data,
  dataKey,
  format,
}: {
  title: string;
  data: any[];
  dataKey: string;
  format: (ts: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <XAxis dataKey="timestamp" tickFormatter={format} stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip labelFormatter={(value) => format(Number(value))} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
