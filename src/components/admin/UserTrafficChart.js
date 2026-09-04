"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function TrafficTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-surface-2 px-3 py-2">
      <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display text-lg text-highlight tracking-display">
        {payload[0].value} requests
      </p>
    </div>
  );
}

export function UserTrafficChart({ data }) {
  return (
    <div className="border border-border p-6 mb-12">
      <h2 className="font-display text-lg uppercase tracking-display text-accent-2 mb-4">
        User Traffic
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--color-muted)"
              tick={{ fill: "var(--color-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--color-muted)"
              tick={{ fill: "var(--color-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<TrafficTooltip />} cursor={{ stroke: "var(--color-border)" }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--color-accent)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
