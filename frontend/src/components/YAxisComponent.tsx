"use client";

export function YAxisComponent({
  data,
  dataKey,
}: {
  data: any[];
  dataKey: string;
}) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => Number(d[dataKey])).filter((v) => !isNaN(v));

  const min = Math.min(...values);
  const max = Math.max(...values);

  const ticks = [max, (max + min) / 2, min];

  return (
    <>
      {ticks.map((t, i) => (
        <text
          key={i}
          x={0}
          y={(i / (ticks.length - 1)) * 200}
          textAnchor="end"
          fill="var(--muted-foreground)"
          fontSize={12}
        >
          {t}
        </text>
      ))}
    </>
  );
}
