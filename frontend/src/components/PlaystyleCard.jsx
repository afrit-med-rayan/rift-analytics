import React from 'react';

/**
 * PlaystyleCard.jsx — Hero card showing playstyle archetype with icon, description,
 * improvement tip, and a 6-bar mini stat breakdown.
 */

const PLAYSTYLE_META = {
  'Aggressive Carry': {
    icon: '⚔️',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    glow: 'rgba(244, 63, 94, 0.25)',
    border: 'rgba(244, 63, 94, 0.3)',
    tagColor: 'var(--clr-rose)',
    tagBg: 'var(--clr-rose-dim)',
    description:
      'You excel in high-action moments — diving fights, picking off enemies, and carrying through individual skill. Your gold income and kill numbers drive your influence.',
    tip: 'Pair aggressive plays with vision. A deep ward before you dive gives you the escape route to avoid throwing the lead.',
    strengths: ['High Damage', 'Kill Presence', 'Carry Potential'],
  },
  'Support-Oriented': {
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)',
    glow: 'rgba(34, 211, 238, 0.2)',
    border: 'rgba(34, 211, 238, 0.3)',
    tagColor: 'var(--clr-cyan)',
    tagBg: 'var(--clr-cyan-dim)',
    description:
      'You play for your team — enabling kills, providing vision, and protecting carries. Your utility-first approach creates the conditions for teammates to thrive.',
    tip: 'Convert your vision advantage into objective control. When you have ward coverage, push your team to take Baron / Dragon.',
    strengths: ['Vision Control', 'Team Enabling', 'Objective Control'],
  },
  Balanced: {
    icon: '⚖️',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
    glow: 'rgba(139, 92, 246, 0.2)',
    border: 'rgba(139, 92, 246, 0.3)',
    tagColor: 'var(--clr-violet)',
    tagBg: 'var(--clr-violet-dim)',
    description:
      'A well-rounded player who contributes across all dimensions — fighting, farming, and warding. Your versatility makes you adaptable to any team composition.',
    tip: 'Identify the weakest dimension in each game and temporarily specialise to give your team the edge it needs.',
    strengths: ['Adaptability', 'Consistent Farm', 'Fight Presence'],
  },
  'Passive-Struggling': {
    icon: '📈',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #84cc16 100%)',
    glow: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.3)',
    tagColor: 'var(--clr-gold)',
    tagBg: 'var(--clr-gold-dim)',
    description:
      'Currently trending towards a conservative, farm-first style. Risk metrics are elevated but this is the ideal time to identify and drill key fundamentals.',
    tip: 'Set a tangible goal per game: 7 CS/min or 1 control ward per back. Small habits compound into rating gains.',
    strengths: ['Safe Playstyle', 'Patiently Scaling', 'Learning Phase'],
  },
  'Vision-Dominant': {
    icon: '👁️',
    gradient: 'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)',
    glow: 'rgba(16, 185, 129, 0.2)',
    border: 'rgba(16, 185, 129, 0.3)',
    tagColor: 'var(--clr-emerald)',
    tagBg: 'var(--clr-emerald-dim)',
    description:
      'Your warding habits are elite — you consistently create information asymmetry that translates into map control and safer objective trades for your team.',
    tip: 'Channel your vision advantage into shot-calling objective timers. You see the map most clearly — lead your team with it.',
    strengths: ['Elite Vision', 'Map Awareness', 'Objective Control'],
  },
};

const DEFAULT_META = {
  icon: '🎮',
  gradient: 'linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)',
  glow: 'rgba(139, 92, 246, 0.2)',
  border: 'rgba(139, 92, 246, 0.3)',
  tagColor: '#8b5cf6',
  tagBg: 'rgba(139,92,246,0.1)',
  description: 'Unique player archetype identified by the clustering model.',
  tip: 'Keep playing and collecting data for a more personalised analysis.',
  strengths: ['Unique Style'],
};

function StatBar({ label, value, max = 100, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value.toFixed(2)}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: '2px',
            transition: 'width 800ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

export default function PlaystyleCard({ data }) {
  if (!data) {
    return (
      <div className="glass-card" style={{ height: '340px' }}>
        <div className="skeleton w-full" style={{ height: '100%', borderRadius: '12px' }} />
      </div>
    );
  }

  const { playstyle, cluster_id } = data;
  const meta = PLAYSTYLE_META[playstyle] ?? DEFAULT_META;

  const {
    kda_ratio = 0,
    gold_per_min = 0,
    kill_participation = 0,
    vision_control = 0,
    damage_efficiency = 0,
    death_rate = 0,
  } = data;

  return (
    <div
      className="glass-card fade-up fade-up-1"
      style={{
        borderColor: meta.border,
        boxShadow: `0 0 40px ${meta.glow}`,
      }}
    >
      {/* Hero header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '20px',
      }}>
        {/* Icon badge */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: meta.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          flexShrink: 0,
          boxShadow: `0 8px 24px ${meta.glow}`,
        }}>
          {meta.icon}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: '4px',
          }}>
            Playstyle Archetype · Cluster {cluster_id}
          </div>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            background: meta.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.2,
          }}>
            {playstyle}
          </div>
          {/* Strength tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {meta.strengths.map((s) => (
              <span key={s} style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '99px',
                color: meta.tagColor,
                background: meta.tagBg,
                border: `1px solid ${meta.border}`,
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.85rem',
        color: '#94a3b8',
        lineHeight: 1.65,
        marginBottom: '20px',
      }}>
        {meta.description}
      </p>

      {/* Stat bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <StatBar label="KDA Ratio"         value={kda_ratio}         max={10} color="#8b5cf6" />
        <StatBar label="Gold Per Min"      value={gold_per_min}      max={600} color="#f59e0b" />
        <StatBar label="Kill Participation" value={kill_participation} max={1}  color="#22d3ee" />
        <StatBar label="Vision Control"    value={vision_control}    max={2}  color="#10b981" />
        <StatBar label="Dmg Efficiency"    value={damage_efficiency} max={3}  color="#f43f5e" />
        <StatBar label="Death Rate"        value={death_rate}        max={0.5} color="#fb923c" />
      </div>

      {/* Improvement tip */}
      <div style={{
        background: `${meta.glow.replace('0.2)', '0.06)')}`,
        border: `1px solid ${meta.border}`,
        borderRadius: '10px',
        padding: '12px 14px',
        fontSize: '0.8rem',
        color: '#f1f5f9',
        lineHeight: 1.6,
      }}>
        <span style={{ fontWeight: 700, color: meta.tagColor }}>💡 Coaching Tip: </span>
        {meta.tip}
      </div>
    </div>
  );
}
