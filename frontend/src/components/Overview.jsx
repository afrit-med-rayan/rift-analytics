import React from 'react';

/**
 * Overview.jsx — Top stat cards: win rate, avg KDA, avg performance, playstyle.
 */

const PLAYSTYLE_META = {
  'Aggressive Carry': {
    icon: '⚔️',
    color: 'rose',
    tip: 'Play for picks and early skirmishes. Snowball hard.',
  },
  'Support-Oriented': {
    icon: '🛡️',
    color: 'cyan',
    tip: 'Prioritize vision control and peel for carries.',
  },
  Balanced: {
    icon: '⚖️',
    color: 'violet',
    tip: 'Versatile player — adapt to what the game needs.',
  },
  'Passive-Struggling': {
    icon: '📉',
    color: 'gold',
    tip: 'Focus on farming and surviving over fighting.',
  },
  'Vision-Dominant': {
    icon: '👁️',
    color: 'emerald',
    tip: 'Your warding creates asymmetric information advantages.',
  },
};

function StatCard({ label, value, sub, color, icon, delay = 0 }) {
  return (
    <div
      className={`glass-card fade-up fade-up-${delay}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="card-title">{label}</span>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>
      <div
        className="mono"
        style={{
          fontSize: '2.4rem',
          fontWeight: 700,
          lineHeight: 1,
          background: `var(--clr-${color})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default function Overview({ data }) {
  if (!data) {
    return (
      <div className="grid-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card" style={{ height: '130px' }}>
            <div className="skeleton w-full" style={{ height: '100%', borderRadius: '12px' }} />
          </div>
        ))}
      </div>
    );
  }

  const { win_probability, performance_score, playstyle } = data;
  const meta = PLAYSTYLE_META[playstyle] || { icon: '🎮', color: 'violet', tip: '' };

  const winPct = `${(win_probability * 100).toFixed(1)}%`;
  const perfScore = performance_score.toFixed(1);

  const kdaRatio = data.kda_ratio != null ? data.kda_ratio.toFixed(2) : '—';
  const gpm = data.gold_per_min != null ? `${Math.round(data.gold_per_min)}` : '—';

  return (
    <div className="grid-4">
      <StatCard
        label="Win Probability"
        value={winPct}
        sub={win_probability >= 0.5 ? '✅ Favoured to win' : '⚠️ Disadvantaged'}
        color="violet"
        icon="🎯"
        delay={1}
      />
      <StatCard
        label="Performance Score"
        value={perfScore}
        sub="/ 100 composite rating"
        color="gold"
        icon="⭐"
        delay={2}
      />
      <StatCard
        label="KDA Ratio"
        value={kdaRatio}
        sub="(Kills + Assists) / Deaths"
        color="cyan"
        icon="⚔️"
        delay={3}
      />
      <StatCard
        label="Gold Per Min"
        value={gpm}
        sub="GPM — resource income"
        color="emerald"
        icon="💰"
        delay={4}
      />
    </div>
  );
}
