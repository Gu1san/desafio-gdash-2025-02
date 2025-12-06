"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";

type ChartType = "line" | "area" | "bar";

interface ChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  format: (ts: number) => string;
  type?: ChartType;
  unit?: string;
}

export default function ChartCard({
  title,
  data,
  dataKey,
  format,
  type = "line",
  unit = "",
}: ChartCardProps) {
  const allZero =
    data.length > 0 &&
    data.every((d) => Number(d[dataKey]) === 0 || d[dataKey] === null);

  const renderLabels = () => (
    <LabelList
      dataKey={dataKey}
      valueAccessor={(entry: any) => entry[dataKey]}
      content={(props) => {
        const { x, y, value } = props;
        if (value == null) return null;

        return (
          <text
            x={x}
            y={typeof y === "number" ? y - 8 : y}
            textAnchor="middle"
            fontSize={12}
            fill="var(--foreground)"
          >
            {value}
            {unit}
          </text>
        );
      }}
    />
  );

  const commonChildren = (
    <>
      <XAxis dataKey="timestamp" tickFormatter={format} stroke="#888" />
      <YAxis stroke="#888" />
    </>
  );

  const renderChart = () => {
    if (allZero) {
      return (
        <div className="flex items-center justify-center h-[180px] text-muted-foreground">
          Sem dados disponíveis
        </div>
      );
    }

    switch (type) {
      case "area":
        return (
          <AreaChart data={data}>
            {commonChildren}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#2563eb"
              fill="#2563eb22"
              strokeWidth={2}
            >
              {renderLabels()}
            </Area>
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            {commonChildren}
            <Bar dataKey={dataKey} fill="#2563eb">
              {renderLabels()}
            </Bar>
          </BarChart>
        );

      default:
        return (
          <LineChart data={data}>
            {commonChildren}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            >
              {renderLabels()}
            </Line>
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Scrollbar estilizado */}
        <div
          className="
            chart-scroll overflow-x-auto
          "
        >
          <div className="min-w-[700px]">
            <ResponsiveContainer width="100%" height={240}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
