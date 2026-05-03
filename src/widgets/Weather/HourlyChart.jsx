import { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  Cell
} from 'recharts';

// Track the parent's measured size and feed explicit width/height to Recharts.
// We deliberately do NOT derive height from width × aspect — the parent's CSS
// (clamp with cqb) decides how tall the chart can be, so a wide-but-short
// widget doesn't end up with a chart that pushes the rest of the layout
// outside the body. ResizeObserver fires on real layout, eliminating the
// "width(-1)" warning Recharts emits when measured before paint.
function MeasuredChart({ children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      if (!w || !h) return;
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {size.w > 0 && size.h > 0 ? (
        <ComposedChartWithSize width={size.w} height={size.h}>
          {children}
        </ComposedChartWithSize>
      ) : null}
    </div>
  );
}

function ComposedChartWithSize({ width, height, children }) {
  return (
    <ResponsiveContainer width={width} height={height}>
      {children}
    </ResponsiveContainer>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const tempPayload = payload.find((p) => p.dataKey === 'temp');
  const popPayload = payload.find((p) => p.dataKey === 'pop');
  return (
    <div className="weather__tooltip">
      <div className="weather__tooltip-time">{label}</div>
      <div className="weather__tooltip-row">
        <span className="weather__tooltip-dot" style={{ background: '#ffb377' }} />
        <span>{Math.round(tempPayload?.value ?? 0)}°</span>
      </div>
      {popPayload && popPayload.value > 0 && (
        <div className="weather__tooltip-row weather__tooltip-row--muted">
          <span className="weather__tooltip-dot" style={{ background: '#9bb8ff' }} />
          <span>{Math.round(popPayload.value)}% lluvia</span>
        </div>
      )}
    </div>
  );
}

function MaxMinDot({ cx, cy, fill, label, above }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r="4" fill={fill} />
      <circle cx={cx} cy={cy} r="7" fill={fill} opacity="0.25" />
      <text
        x={cx}
        y={above ? cy - 12 : cy + 18}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={fill}
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

// Locate the current hour within the hourly array. Open-Meteo's `current.time`
// can carry minute precision (e.g. "T13:34") while `hourly.time` is hour-aligned
// ("T13:00"), so a strict `===` lookup misses; we compare as Dates and pick the
// most recent hour at or before "now". All times are wall-clock in the
// location's timezone — comparing them as Dates is consistent because both
// strings get parsed with the same (browser) TZ bias.
function findStartIdx(hourly, current) {
  if (!hourly?.time?.length) return 0;
  const ref = current?.time ? new Date(current.time).getTime() : Date.now();
  let last = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    const t = new Date(hourly.time[i]).getTime();
    if (t <= ref) last = i;
    else break;
  }
  return last;
}

export function HourlyChart({ hourly, current }) {
  if (!hourly?.time?.length) return null;
  const startIdx = findStartIdx(hourly, current);
  const N = 12;
  const data = hourly.time.slice(startIdx, startIdx + N).map((iso, i) => {
    const d = new Date(iso);
    return {
      iso,
      hour: `${String(d.getHours()).padStart(2, '0')}h`,
      hourNum: d.getHours(),
      temp: hourly.temperature_2m[startIdx + i],
      pop: hourly.precipitation_probability[startIdx + i] ?? 0
    };
  });

  if (data.length < 2) return null;

  const tMax = Math.max(...data.map((d) => d.temp));
  const tMin = Math.min(...data.map((d) => d.temp));
  const tRange = Math.max(2, tMax - tMin);
  const yMin = Math.floor(tMin - tRange * 0.2);
  const yMax = Math.ceil(tMax + tRange * 0.3);
  const maxItem = data.find((d) => d.temp === tMax);
  const minItem = data.find((d) => d.temp === tMin);

  return (
    <MeasuredChart>
      <ComposedChart
        data={data}
        margin={{ top: 22, right: 14, left: -28, bottom: 4 }}
      >
        <defs>
          <linearGradient id="wch-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffb377" />
            <stop offset="100%" stopColor="#9bb8ff" />
          </linearGradient>
          <linearGradient id="wch-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 179, 119, 0.45)" />
            <stop offset="60%" stopColor="rgba(155, 184, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(155, 184, 255, 0)" />
          </linearGradient>
          <linearGradient id="wch-pop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(155, 184, 255, 0.55)" />
            <stop offset="100%" stopColor="rgba(155, 184, 255, 0.15)" />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="hour"
          stroke="rgba(255,255,255,0.45)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={20}
          dy={4}
        />
        <YAxis
          domain={[yMin, yMax]}
          hide
        />
        <YAxis
          yAxisId="pop"
          orientation="right"
          domain={[0, 100]}
          hide
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
        />

        <Bar
          yAxisId="pop"
          dataKey="pop"
          fill="url(#wch-pop)"
          radius={[3, 3, 0, 0]}
          maxBarSize={14}
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fillOpacity={entry.pop > 0 ? 1 : 0} />
          ))}
        </Bar>

        <Area
          type="monotone"
          dataKey="temp"
          stroke="url(#wch-stroke)"
          strokeWidth={2.5}
          fill="url(#wch-fill)"
          dot={{ fill: 'rgba(255,255,255,0.85)', strokeWidth: 0, r: 2.5 }}
          activeDot={{ r: 5, fill: '#fff', stroke: '#ffb377', strokeWidth: 2 }}
          isAnimationActive={false}
        />

        {maxItem && (
          <ReferenceDot
            x={maxItem.hour}
            y={maxItem.temp}
            shape={(props) => (
              <MaxMinDot
                cx={props.cx}
                cy={props.cy}
                fill="#ff8e57"
                label={`▲ ${Math.round(tMax)}°`}
                above
              />
            )}
            ifOverflow="extendDomain"
          />
        )}
        {minItem && minItem !== maxItem && (
          <ReferenceDot
            x={minItem.hour}
            y={minItem.temp}
            shape={(props) => (
              <MaxMinDot
                cx={props.cx}
                cy={props.cy}
                fill="#9bb8ff"
                label={`▼ ${Math.round(tMin)}°`}
                above={false}
              />
            )}
            ifOverflow="extendDomain"
          />
        )}
      </ComposedChart>
    </MeasuredChart>
  );
}
