import React from 'react';

/**
 * PlaystyleCard.jsx — Hero card showing playstyle archetype in a Hextech style.
 */

const PLAYSTYLE_META = {
  'Aggressive Carry': {
    icon: '⚔️',
    borderCol: 'var(--sev-high)', /* Noxus Red */
    bgCol: 'rgba(209, 54, 57, 0.1)',
    description: 'You excel in high-action moments — diving fights, picking off enemies, and carrying through individual skill. Your gold income and kill numbers drive your influence.',
    tip: 'Pair aggressive plays with vision. A deep ward before you dive gives you the escape route to avoid throwing the lead.',
    strengths: ['High Damage', 'Kill Presence', 'Carry Potential'],
  },
  'Support-Oriented': {
    icon: '🛡️',
    borderCol: 'var(--clr-cyan)', /* Magic Hextech */
    bgCol: 'rgba(10, 200, 185, 0.1)',
    description: 'You play for your team — enabling kills, providing vision, and protecting carries. Your utility-first approach creates the conditions for teammates to thrive.',
    tip: 'Convert your vision advantage into objective control. When you have ward coverage, push your team to take Baron / Dragon.',
    strengths: ['Vision Control', 'Team Enabling', 'Objective Control'],
  },
  Balanced: {
    icon: '⚖️',
    borderCol: 'var(--clr-gold-accent)', /* Shurima Gold */
    bgCol: 'rgba(200, 170, 110, 0.1)',
    description: 'A well-rounded player who contributes across all dimensions — fighting, farming, and warding. Your versatility makes you adaptable to any team composition.',
    tip: 'Identify the weakest dimension in each game and temporarily specialise to give your team the edge it needs.',
    strengths: ['Adaptability', 'Consistent Farm', 'Fight Presence'],
  },
  'Passive-Struggling': {
    icon: '📈',
    borderCol: 'var(--txt-secondary)',
    bgCol: 'rgba(160, 155, 140, 0.1)',
    description: 'Currently trending towards a conservative, farm-first style. Risk metrics are elevated but this is the ideal time to identify and drill key fundamentals.',
    tip: 'Set a tangible goal per game: 7 CS/min or 1 control ward per back. Small habits compound into rating gains.',
    strengths: ['Safe Playstyle', 'Patiently Scaling', 'Learning Phase'],
  },
  'Vision-Dominant': {
    icon: '👁️',
    borderCol: 'var(--sev-low)', /* Chemtech Green */
    bgCol: 'rgba(0, 191, 165, 0.1)',
    description: 'Your warding habits are elite — you consistently create information asymmetry that translates into map control and safer objective trades for your team.',
    tip: 'Channel your vision advantage into shot-calling objective timers. You see the map most clearly — lead your team with it.',
    strengths: ['Elite Vision', 'Map Awareness', 'Objective Control'],
  },
};

const DEFAULT_META = {
  icon: '🎮',
  borderCol: 'var(--clr-gold-accent)',
  bgCol: 'rgba(200,170,110,0.1)',
  description: 'Unique player archetype identified by the clustering model.',
  tip: 'Keep playing and collecting data for a more personalised analysis.',
  strengths: ['Unique Style'],
};

function StatBar({ label, value, max = 100, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div className="font-tech" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--txt-secondary)', textTransform: 'uppercase' }}>
        <span>{label}</span>
        <span className="mono" style={{ color: 'var(--clr-gold)' }}>{value.toFixed(2)}</span>
      </div>
      <div style={{ height: '6px', background: '#010a13', border: '1px solid var(--clr-border)', position: 'relative' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 800ms var(--ease)',
          }}
        />
        {/* Hextech notches */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '25%', width: '1px', background: 'var(--clr-border)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'var(--clr-border)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: '1px', background: 'var(--clr-border)' }} />
      </div>
    </div>
  );
}

export default function PlaystyleCard({ data }) {
  if (!data) {
    return (
      <div className="hextech-panel" style={{ height: '340px' }}>
        <div className="skeleton w-full" style={{ height: '100%' }} />
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
      className="hextech-panel fade-up fade-up-1"
      style={{
        boxShadow: `inset 0 0 40px ${meta.bgCol}, 0 4px 12px rgba(0,0,0,0.5)`,
        borderTop: `2px solid ${meta.borderCol}`
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {/* Hextech Icon Base (Diamond/Rhombus shape) */}
        <div style={{
          width: '72px',
          height: '72px',
          background: '#010a13',
          border: `2px solid ${meta.borderCol}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          flexShrink: 0,
          transform: 'rotate(45deg)',
          boxShadow: `0 0 15px ${meta.bgCol}`
        }}>
          <span style={{ transform: 'rotate(-45deg)' }}>{meta.icon}</span>
        </div>

        <div style={{ flex: 1, marginTop: '8px' }}>
          <div className="font-tech" style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--clr-gold-accent)',
            marginBottom: '4px',
          }}>
            [ Cluster 0{cluster_id} Classification ]
          </div>
          <div className="font-epic" style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: meta.borderCol,
            lineHeight: 1.2,
            textTransform: 'uppercase',
            textShadow: `0 2px 8px ${meta.bgCol}`
          }}>
            {playstyle}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {meta.strengths.map((s) => (
              <span key={s} className="font-tech" style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                color: 'var(--clr-bg)',
                background: meta.borderCol,
                border: `1px solid ${meta.borderCol}`,
                textTransform: 'uppercase'
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '0.9rem',
        color: 'var(--txt-secondary)',
        lineHeight: 1.6,
        marginBottom: '24px',
        borderLeft: `2px solid ${meta.borderCol}`,
        paddingLeft: '12px'
      }}>
        {meta.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <StatBar label="KDA Ratio"         value={kda_ratio}         max={10} color="var(--clr-cyan)" />
        <StatBar label="Gold Per Min"      value={gold_per_min}      max={600} color="var(--clr-gold-accent)" />
        <StatBar label="Kill Participation" value={kill_participation} max={1}  color="var(--clr-cyan)" />
        <StatBar label="Vision Control"    value={vision_control}    max={2}  color="var(--sev-low)" />
        <StatBar label="Dmg Efficiency"    value={damage_efficiency} max={3}  color="var(--sev-high)" />
        <StatBar label="Death Rate"        value={death_rate}        max={0.5} color="var(--clr-gold-accent)" />
      </div>

      <div className="font-tech" style={{
        background: 'rgba(200, 170, 110, 0.05)',
        border: '1px solid var(--clr-border-gold)',
        padding: '12px 16px',
        fontSize: '0.85rem',
        color: 'var(--clr-gold)',
        lineHeight: 1.5,
        letterSpacing: '0.05em'
      }}>
        <span style={{ fontWeight: 700, color: 'var(--clr-gold-accent)', textTransform: 'uppercase' }}>System Directive: </span>
        {meta.tip}
      </div>
    </div>
  );
}
