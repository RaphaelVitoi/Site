// @ts-nocheck
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TelemetryCharts({ data }: { data: any[] }) {
  const formattedData = data.map((d, i) => ({
    name: `DECISÃO ${i + 1}`,
    evLoss: d.evLoss,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#475569"
            tick={{
              fill: "#94a3b8",
              fontSize: 9,
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#475569"
            tick={{
              fill: "#94a3b8",
              fontSize: 10,
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderColor: "rgba(99,102,241,0.3)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
            itemStyle={{
              fontWeight: 900,
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#6366f1",
            }}
            labelStyle={{ color: "#fff", fontWeight: 900, marginBottom: "8px" }}
          />
          <Line
            type="stepAfter"
            dataKey="evLoss"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, fill: "#020617", stroke: "#6366f1", strokeWidth: 2 }}
            name="EV LOSS"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
