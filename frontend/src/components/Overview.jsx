import React from 'react';

/**
 * Overview.jsx — Top stat cards: win rate, avg KDA, avg performance, playstyle.
 */

const PLAYSTYLE_META = {
  'Aggressive Carry': {
    icon: '⚔️',
    color: 'var(--sev-high)',
    tip: 'Play for picks and early skirmishes. Snowball hard.',
  },
  'Support-Oriented': {
    icon: '🛡️',
    color: 'var(--clr-cyan)',
    tip: 'Prioritize vision control and peel for carries.',
  },
  Balanced: {
    icon: '⚖️',
    color: 'var(--clr-gold-accent)',
    tip: 'Versatile player — adapt to what the game needs.',
  },
  'Passive-Struggling': {
    icon: '📉',
    color: 'var(--txt-secondary)',
    tip: 'Focus on farming and surviving over fighting.',
  },
  'Vision-Dominant': {
    icon: '👁️',
    color: 'var(--sev-low)',
    tip: 'Your warding creates asymmetric information advantages.',
  },
};

function StatCard({ label, value, sub, color, icon, delay = 0 }) {
  return (
    <div
      className={`hextech-panel fade-up fade-up-${delay}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="font-epic" style={{ fontSize: '0.8rem', color: 'var(--txt-secondary)', letterSpacing: '0.1em' }}>{label}</span>
        <span style={{ fontSize: '1.4rem', textShadow: `0 0 10px ${color}` }}>{icon}</span>
      </div>
      <div
        className="font-tech"
        style={{
          fontSize: '2.8rem',
          fontWeight: 700,
          lineHeight: 1,
          color: color,
          textShadow: `0 0 15px ${color}33`,
        }}
      >
        {value}
      </div>
      {sub && (
        <div className="font-tech" style={{ fontSize: '0.8rem', color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {sub}
        </div>
      )}
      
      {/* Decorative side accent */}
      <div style={{ position: 'absolute', top: '15%', left: 0, bottom: '15%', width: '3px', background: color, opacity: 0.8, boxShadow: `0 0 8px ${color}` }} />
    </div>
  );
}

export default function Overview({ data }) {
  if (!data) {
    return (
      <div className="grid-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="hextech-panel" style={{ height: '130px' }}>
            <div className="skeleton w-full" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  const { win_probability, performance_score, playstyle } = data;

  const winPct = `${(win_probability * 100).toFixed(1)}%`;
  const perfScore = performance_score.toFixed(1);
  const kdaRatio = data.kda_ratio != null ? data.kda_ratio.toFixed(2) : '—';
  const gpm = data.gold_per_min != null ? `${Math.round(data.gold_per_min)}` : '—';

  return (
    <div className="grid-4">
      <StatCard
        label="Win Probability"
        value={winPct}
        sub={win_probability >= 0.5 ? 'Favoured' : 'Disadvantaged'}
        color="var(--clr-cyan)"
        icon="🎯"
        delay={1}
      />
      <StatCard
        label="Performance"
        value={perfScore}
        sub="/ 100 System Rating"
        color="var(--clr-gold-accent)"
        icon="⭐"
        delay={2}
      />
      <StatCard
        label="KDA Ratio"
        value={kdaRatio}
        sub="(K+A) / D"
        color="var(--sev-high)"
        icon="⚔️"
        delay={3}
      />
      <StatCard
        label="Gold / Min"
        value={gpm}
        sub="Resource Income"
        color="var(--sev-low)"
        icon="💰"
        delay={4}
      />
    </div>
  );
}
