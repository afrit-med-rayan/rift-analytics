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

/**
 * Given raw player stats, normalise each dimension to 0-100
 * using rough population benchmarks derived from the training data.
 */
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
      background: 'rgba(13,14,26,0.95)',
      border: '1px solid rgba(139,92,246,0.3)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.82rem',
      color: '#f1f5f9',
    }}>
      <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' }}>{dim}</div>
      <div>{value.toFixed(1)} / 100</div>
    </div>
  );
};

function PlayerRadar({ player }) {
  const data = buildRadarData(player);
  return (
    <div className="glass-card fade-up fade-up-2" style={{ minHeight: '340px' }}>
      <p className="card-title">Performance Radar</p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="rgba(255,255,255,0.06)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
            tickLine={false}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <defs>
            <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Radar
            name="Player"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#radarGrad)"
            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
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

/** Deterministically generate a reasonable-looking performance history. */
function buildTrendData(baseScore) {
  const games = 10;
  const points = [];
  let score = baseScore;

  // seed based on baseScore for reproducibility
  const seed = Math.floor(baseScore * 137);
  const pseudoRand = (i) => {
    const x = Math.sin(seed + i * 7.3) * 10000;
    return x - Math.floor(x); // 0-1
  };

  for (let i = games; i >= 1; i--) {
    const noise = (pseudoRand(i) - 0.5) * 25;
    const val = Math.max(5, Math.min(100, baseScore + noise));
    points.push({ game: `G-${i}`, score: parseFloat(val.toFixed(1)) });
  }
  points.push({ game: 'Now', score: parseFloat(baseScore.toFixed(1)) });
  return points;
}

const CustomLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(13,14,26,0.95)',
      border: '1px solid rgba(139,92,246,0.3)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.82rem',
      color: '#f1f5f9',
    }}>
      <div style={{ color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#8b5cf6', fontWeight: 700 }}>
        Score: {payload[0].value}
      </div>
    </div>
  );
};

function PerformanceTrend({ score }) {
  const data = buildTrendData(score);
  const avg = data.reduce((s, d) => s + d.score, 0) / data.length;

  return (
    <div className="glass-card fade-up fade-up-3" style={{ minHeight: '340px' }}>
      <p className="card-title">Performance Trend (Simulated History)</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <XAxis
            dataKey="game"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Outfit, sans-serif' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Outfit, sans-serif' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1 }} />
          <ReferenceLine
            y={avg}
            stroke="rgba(245, 158, 11, 0.4)"
            strokeDasharray="6 3"
            label={{ value: `Avg ${avg.toFixed(0)}`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            dot={(props) => {
              const isNow = props.payload.game === 'Now';
              return (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={isNow ? 6 : 3.5}
                  fill={isNow ? '#f59e0b' : '#8b5cf6'}
                  stroke={isNow ? 'rgba(245,158,11,0.4)' : 'rgba(139,92,246,0.3)'}
                  strokeWidth={isNow ? 4 : 2}
                />
              );
            }}
            activeDot={{ r: 7, fill: '#8b5cf6', stroke: 'rgba(139,92,246,0.4)', strokeWidth: 4 }}
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
          <div key={i} className="glass-card" style={{ height: '340px' }}>
            <div className="skeleton w-full" style={{ height: '100%', borderRadius: '12px' }} />
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
