"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ModeToggle";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import WeeklyForecast from "@/components/WeeklyForecast";

import { useWeather } from "@/contexts/WeatherContext";
import { useInsights } from "@/contexts/InsightsContext";

import { useEffect } from "react";
import ChartCard from "@/components/ChartCard";

export default function Dashboard() {
  const {
    logs,
    current,
    hourly,
    daily,
    isLoading: weatherLoading,
    refresh,
    exportData,
  } = useWeather();

  const { insights, isLoading: insightsLoading, regenerate } = useInsights();

  useEffect(() => {
    refresh();
  }, []);

  if (weatherLoading || !current)
    return <p className="p-6">Carregando dados do clima...</p>;

  const formatHour = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const hourlyChartData = hourly.map((h) => ({
    timestamp: h.timestamp,
    temperature: h.temperature,
    humidity: h.humidity,
    wind_speed: h.wind_speed,
    precipitation: h.precipitation,
    cloud_cover: h.cloud_cover,
  }));

  return (
    <div className="dashboard-grid">
      {/* INSIGHTS */}
      <Card className="insights-card">
        <CardHeader className="insights-header">
          <CardTitle className="insights-title">Insights de IA</CardTitle>
          <Button onClick={regenerate}>Regerar insights</Button>
        </CardHeader>

        <CardContent>
          {insightsLoading ? (
            <p className="insights-loading">Gerando insights...</p>
          ) : insights ? (
            <div className="insights-content">
              <p>
                <strong>Resumo:</strong> {insights.summary}
              </p>
              <p>
                <strong>Dia mais quente:</strong> {insights.hottestDay}
              </p>
              <p>
                <strong>Precipitação:</strong> {insights.precipitation}mm
              </p>
              <p>
                <strong>Tendência de temperatura:</strong> {insights.tempTrend}
              </p>
              <p>
                <strong>Sensação térmica:</strong>{" "}
                {insights.apparentTemperature}°C
              </p>
            </div>
          ) : (
            <p className="insights-loading">Nenhum insight disponível.</p>
          )}
        </CardContent>
      </Card>

      {/* BOTÕES DE EXPORTAÇÃO */}
      <div className="export-buttons">
        <Button onClick={() => exportData("csv")} className="export-btn-csv">
          Exportar CSV
        </Button>

        <Button onClick={() => exportData("xlsx")} className="export-btn-xlsx">
          Exportar XLSX
        </Button>
      </div>

      <ThemeToggle />

      <CurrentWeatherCard current={current} location={logs.city} />

      <WeeklyForecast daily={daily} />

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
        type="bar"
      />

      <ChartCard
        title="Chuva (mm)"
        data={hourlyChartData}
        dataKey="precipitation"
        format={formatHour}
        type="bar"
      />

      <ChartCard
        title="Nuvens (%)"
        data={hourlyChartData}
        dataKey="cloud_cover"
        format={formatHour}
        type="area"
      />
    </div>
  );
}
