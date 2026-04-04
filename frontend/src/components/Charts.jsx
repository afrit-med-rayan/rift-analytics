import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Radar Chart — 6-dimension performance profile                       */
/* ------------------------------------------------------------------ */

function buildRadarData(player) {
  const clamp = (v, min, max) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

  return [
    { dim: 'KDA',          value: clamp(player.kda_ratio ?? 0,         0, 10)  },
    { dim: 'Gold/Min',     value: clamp(player.gold_per_min ?? 0,       150, 600) },
    { dim: 'Dmg Eff.',     value: clamp(player.damage_efficiency ?? 0,  0, 3)   },
    { dim: 'Kill Part.',   value: clamp(player.kill_participation ?? 0, 0, 1)   },
    { dim: 'Vision',       value: clamp(player.vision_control ?? 0,     0, 2)   },
    { dim: 'Survival',     value: clamp(1 - (player.death_rate ?? 0) * 5, 0, 1) * 100 },
  ];
}

const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { dim, value } = payload[0].payload;
  return (
    <div style={{
      background: '#010a13',
      border: '1px solid #c8aa6e',
      padding: '8px 12px',
      fontSize: '0.82rem',
      color: '#f0e6d2',
      fontFamily: 'Rajdhani, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      boxShadow: '0 4px 12px rgba(0,0,0,0.8), inset 0 0 10px rgba(200, 170, 110, 0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#0ac8b9', marginBottom: '2px' }}>{dim}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value.toFixed(1)} / 100</div>
    </div>
  );
};

function PlayerRadar({ player }) {
  const data = buildRadarData(player);
  return (
    <div className="hextech-panel fade-up fade-up-2" style={{ minHeight: '340px' }}>
      <p className="card-title">Combat Telemetry</p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="#1e2328"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: '#c8aa6e', fontSize: 11, fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, textTransform: 'uppercase' }}
            tickLine={false}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <defs>
            <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ac8b9" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0ac8b9" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Radar
            name="Player"
            dataKey="value"
            stroke="#0ac8b9"
            strokeWidth={2}
            fill="url(#radarGrad)"
            dot={{ r: 3, fill: '#010a13', stroke: '#0ac8b9', strokeWidth: 2 }}
          />
          <Tooltip content={<CustomRadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Line Chart — simulated performance trend over recent games          */
/* ------------------------------------------------------------------ */

function buildTrendData(baseScore) {
  const games = 10;
  const points = [];
  let score = baseScore;

  const seed = Math.floor(baseScore * 137);
  const pseudoRand = (i) => {
    const x = Math.sin(seed + i * 7.3) * 10000;
    return x - Math.floor(x);
  };

  for (let i = games; i >= 1; i--) {
    const noise = (pseudoRand(i) - 0.5) * 25;
    const val = Math.max(5, Math.min(100, baseScore + noise));
    points.push({ game: `G-${i}`, score: parseFloat(val.toFixed(1)) });
  }
  points.push({ game: 'NOW', score: parseFloat(baseScore.toFixed(1)) });
  return points;
}

const CustomLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#010a13',
      border: '1px solid #c8aa6e',
      padding: '8px 12px',
      fontSize: '0.82rem',
      color: '#f0e6d2',
      fontFamily: 'Rajdhani, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      boxShadow: '0 4px 12px rgba(0,0,0,0.8), inset 0 0 10px rgba(200, 170, 110, 0.1)',
    }}>
      <div style={{ color: '#a09b8c', marginBottom: '4px' }}>Match: {label}</div>
      <div style={{ color: '#c8aa6e', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
        Rating: {payload[0].value}
      </div>
    </div>
  );
};

function PerformanceTrend({ score }) {
  const data = buildTrendData(score);
  const avg = data.reduce((s, d) => s + d.score, 0) / data.length;

  return (
    <div className="hextech-panel fade-up fade-up-3" style={{ minHeight: '340px' }}>
      <p className="card-title">Performance Trend Matrix</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8aa6e" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#c8aa6e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2328" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="game"
            tick={{ fill: '#a09b8c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#1e2328' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#a09b8c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#c8aa6e', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <ReferenceLine
            y={avg}
            stroke="#0ac8b9"
            strokeDasharray="4 4"
            label={{ value: `SYS AVG ${avg.toFixed(0)}`, fill: '#0ac8b9', fontSize: 10, position: 'insideTopRight', fontFamily: 'Rajdhani, sans-serif' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#c8aa6e"
            strokeWidth={2}
            dot={(props) => {
              const isNow = props.payload.game === 'NOW';
              return (
                <polygon
                  key={props.index}
                  points={`${props.cx},${props.cy - 4} ${props.cx + 4},${props.cy} ${props.cx},${props.cy + 4} ${props.cx - 4},${props.cy}`}
                  fill={isNow ? '#0ac8b9' : '#010a13'}
                  stroke={isNow ? '#0ac8b9' : '#c8aa6e'}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={(props) => (
              <polygon
                points={`${props.cx},${props.cy - 6} ${props.cx + 6},${props.cy} ${props.cx},${props.cy + 6} ${props.cx - 6},${props.cy}`}
                fill="#c8aa6e"
                stroke="#0ac8b9"
                strokeWidth={2}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                             */
/* ------------------------------------------------------------------ */
export default function Charts({ data }) {
  if (!data) {
    return (
      <div className="grid-2">
        {[1, 2].map((i) => (
          <div key={i} className="hextech-panel" style={{ height: '340px' }}>
            <div className="skeleton w-full" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-2">
      <PlayerRadar player={data} />
      <PerformanceTrend score={data.performance_score} />
    </div>
  );
}
