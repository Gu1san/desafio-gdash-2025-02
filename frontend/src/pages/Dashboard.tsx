"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { IAIInsights } from "@/types/weather";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [weather, setWeather] = useState([]);
  const [insights, setInsights] = useState<IAIInsights>();

  const token = localStorage.getItem("token") ?? undefined;
  const request = api(token);

  useEffect(() => {
    const fetchData = async () => {
      const logs = await fetch("http://localhost:3000/api/weather/logs").then(
        (r) => r.json()
      );
      const ai = await request("/weather/insights");
      setWeather(logs);
      setInsights(ai);
    };
    fetchData();
  }, []);

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ===== INSIGHTS ===== */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-2xl">Insights de IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights ? (
            <>
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
            </>
          ) : (
            <p className="text-muted-foreground">Carregando insights...</p>
          )}
        </CardContent>
      </Card>

      {/* ===== TEMPERATURA ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Temperatura (°C)</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={weather} dataKey="temperature" formatDate={formatDate} />
        </CardContent>
      </Card>

      {/* ===== UMIDADE ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Umidade (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={weather} dataKey="humidity" formatDate={formatDate} />
        </CardContent>
      </Card>

      {/* ===== VELOCIDADE DO VENTO ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Vento (km/h)</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={weather} dataKey="wind_speed" formatDate={formatDate} />
        </CardContent>
      </Card>

      {/* ===== CHUVA ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Chuva (mm)</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            data={weather}
            dataKey="precipitation"
            formatDate={formatDate}
          />
        </CardContent>
      </Card>

      {/* ===== COBERTURA DE NUVENS ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Nuvens (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={weather} dataKey="cloud_cover" formatDate={formatDate} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================
   Componente Reusable Chart
====================== */

function Chart({
  data,
  dataKey,
  formatDate,
}: {
  data: any[];
  dataKey: string;
  formatDate: (ts: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" tickFormatter={formatDate} stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip labelFormatter={(value) => formatDate(Number(value))} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
