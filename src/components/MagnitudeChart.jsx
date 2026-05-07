import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const RANGES = [
  { label: '1–2', min: 1, max: 2 },
  { label: '2–3', min: 2, max: 3 },
  { label: '3–4', min: 3, max: 4 },
  { label: '4–5', min: 4, max: 5 },
  { label: '5–6', min: 5, max: 6 },
  { label: '6–7', min: 6, max: 7 },
  { label: '7+', min: 7, max: Infinity },
];

function bucketize(features) {
  const buckets = RANGES.map((r) => ({ range: r.label, count: 0 }));
  for (const f of features) {
    const m = f.properties?.mag;
    if (m == null) continue;
    const idx = RANGES.findIndex((r) => m >= r.min && m < r.max);
    if (idx !== -1) buckets[idx].count += 1;
  }
  return buckets;
}

export function MagnitudeChart({ features }) {
  const data = bucketize(features);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="mag-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd9a8" />
            <stop offset="100%" stopColor="#ff7a3d" />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.08)"
          vertical={false}
        />
        <XAxis
          dataKey="range"
          stroke="rgba(255,255,255,0.55)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.55)"
          tick={{ fontSize: 11 }}
          allowDecimals={false}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{
            background: 'rgba(20, 22, 40, 0.94)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 8,
            fontSize: 12,
            padding: '6px 10px',
          }}
          labelStyle={{ color: 'var(--text-1)' }}
          itemStyle={{ color: 'var(--text-2)' }}
          formatter={(value) => [value, 'events']}
        />
        <Bar dataKey="count" fill="url(#mag-gradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
