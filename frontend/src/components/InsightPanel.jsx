import React from 'react';

/**
 * InsightPanel.jsx — Renders priority-sorted insight cards (Hextech style)
 */

const SEVERITY_CONFIG = {
  high: {
    label: 'Critical Alert',
    color: 'var(--sev-high)', // Noxus Red
    bg: 'rgba(209, 54, 57, 0.05)',
    border: 'rgba(209, 54, 57, 0.4)',
    icon: '⚠',
    bar: 'var(--sev-high)',
  },
  medium: {
    label: 'Warning',
    color: 'var(--sev-medium)', // Shurima Gold
    bg: 'rgba(200, 170, 110, 0.05)',
    border: 'rgba(200, 170, 110, 0.3)',
    icon: '⚑',
    bar: 'var(--sev-medium)',
  },
  low: {
    label: 'Optimal',
    color: 'var(--sev-low)', // Chemtech Green
    bg: 'rgba(0, 191, 165, 0.05)',
    border: 'rgba(0, 191, 165, 0.3)',
    icon: '✓',
    bar: 'var(--sev-low)',
  },
};

function InsightCard({ insight, index }) {
  const cfg = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.low;

  return (
    <div
      className={`fade-up fade-up-${Math.min(index + 1, 5)}`}
      style={{
        background: '#010a13',
        border: `1px solid ${cfg.border}`,
        padding: '16px',
        position: 'relative',
        transition: 'transform var(--dur) var(--ease), border-color var(--dur)',
        cursor: 'default',
        boxShadow: `inset 0 0 15px ${cfg.bg}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.borderColor = cfg.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.borderColor = cfg.border;
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: cfg.bar,
        boxShadow: `0 0 8px ${cfg.color}`,
      }} />

      <div style={{ paddingLeft: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '0.9rem', color: cfg.color }}>{cfg.icon}</span>
          <span className="font-tech" style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: cfg.color,
          }}>
            {cfg.label}
          </span>
          <span className="font-mono" style={{
            marginLeft: 'auto',
            fontSize: '0.7rem',
            color: 'var(--txt-muted)',
          }}>
            LOG_ENTRY_0{index + 1}
          </span>
        </div>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--txt-primary)',
          lineHeight: 1.6,
        }}>
          {insight.text}
        </p>
      </div>
    </div>
  );
}

export default function InsightPanel({ insights }) {
  if (!insights) {
    return (
      <div className="hextech-panel">
        <p className="card-title">System Analysis Log</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '90px' }} />
          ))}
        </div>
      </div>
    );
  }

  const highCount = insights.filter((i) => i.severity === 'high').length;
  const medCount = insights.filter((i) => i.severity === 'medium').length;
  const lowCount = insights.filter((i) => i.severity === 'low').length;

  return (
    <div className="hextech-panel fade-up fade-up-1">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <p className="card-title" style={{ marginBottom: 0 }}>System Analysis Log</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {highCount > 0 && <span className="badge badge-rose">{highCount} CRITICAL</span>}
          {medCount > 0 && <span className="badge badge-gold">{medCount} WARNING</span>}
          {lowCount > 0 && <span className="badge badge-emerald">{lowCount} OPTIMAL</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} index={i} />
        ))}
      </div>

      <div className="font-tech" style={{
        marginTop: '20px',
        padding: '12px',
        background: '#010a13',
        border: '1px solid var(--clr-border)',
        fontSize: '0.75rem',
        color: 'var(--txt-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center'
      }}>
        [ Encrypted Transmission: Model XGB-34 // Telemetry Processed ]
      </div>
    </div>
  );
}
