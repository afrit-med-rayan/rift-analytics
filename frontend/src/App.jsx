import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import Overview from './components/Overview';
import Charts from './components/Charts';
import InsightPanel from './components/InsightPanel';
import PlaystyleCard from './components/PlaystyleCard';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/* ============================================================
   Header
   ============================================================ */
function Header({ onRefresh, loading }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '32px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginBottom: '32px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          boxShadow: '0 8px 24px rgba(139,92,246,0.35)',
          flexShrink: 0,
        }}>
          ⚡
        </div>
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #8b5cf6, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}>
            Rift Analytics
          </h1>
          <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: '3px' }}>
            ML-Powered League of Legends Performance Dashboard
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: '#10b981',
          padding: '5px 12px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '99px',
        }}>
          <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          Live API
        </div>
        <button
          id="refresh-btn"
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '7px 18px',
            borderRadius: '10px',
            border: '1px solid rgba(139,92,246,0.3)',
            background: 'rgba(139,92,246,0.12)',
            color: '#8b5cf6',
            fontSize: '0.8rem',
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'all 220ms ease',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; }}
        >
          {loading ? '⏳ Loading…' : '🔄 Refresh'}
        </button>
      </div>
    </header>
  );
}

/* ============================================================
   Player Input Form
   ============================================================ */
function PlayerForm({ onSubmit, loading, defaultValues }) {
  const [values, setValues] = useState(defaultValues ?? {
    kda_ratio: 1.2,
    gold_per_min: 310,
    damage_efficiency: 0.9,
    kill_participation: 0.4,
    vision_control: 0.3,
    death_rate: 0.15,
    cs_per_min: 5.0,
  });

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const fields = [
    { key: 'kda_ratio',          label: 'KDA Ratio',          hint: '(K+A)/D',       step: 0.1, min: 0, max: 30  },
    { key: 'gold_per_min',       label: 'Gold / Min',         hint: 'GPM',           step: 10,  min: 0, max: 800  },
    { key: 'damage_efficiency',  label: 'Damage Efficiency',  hint: 'Dmg/GoldSpent', step: 0.05,min: 0, max: 5    },
    { key: 'kill_participation', label: 'Kill Participation',  hint: '0-1',           step: 0.01,min: 0, max: 1    },
    { key: 'vision_control',     label: 'Vision Control',     hint: 'per min',       step: 0.05,min: 0, max: 5    },
    { key: 'death_rate',         label: 'Death Rate',         hint: 'Deaths/min',    step: 0.01,min: 0, max: 1    },
    { key: 'cs_per_min',         label: 'CS / Min',           hint: 'Creep Score',   step: 0.5, min: 0, max: 15   },
  ];

  return (
    <div className="glass-card fade-up" style={{ marginBottom: '24px' }}>
      <p className="section-title">Analyse a Player Game</p>
      <form id="player-form" onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}>
          {fields.map(({ key, label, hint, step, min, max }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {label}
                <span style={{ color: '#475569', fontWeight: 400, marginLeft: '4px' }}>({hint})</span>
              </label>
              <input
                id={`input-${key}`}
                type="number"
                step={step}
                min={min}
                max={max}
                value={values[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f1f5f9',
                  fontSize: '0.88rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  width: '100%',
                  transition: 'border-color 220ms ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          ))}
        </div>
        <button
          id="analyse-btn"
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Outfit, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
            transition: 'opacity 220ms ease, transform 220ms ease',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {loading ? '⏳ Analysing…' : '⚡ Analyse Performance'}
        </button>
      </form>
    </div>
  );
}

/* ============================================================
   Error Banner
   ============================================================ */
function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      background: 'rgba(244,63,94,0.1)',
      border: '1px solid rgba(244,63,94,0.3)',
      borderRadius: '12px',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      marginBottom: '24px',
      animation: 'fadeUp 0.3s ease both',
    }}>
      <p style={{ color: '#f43f5e', fontSize: '0.85rem' }}>
        ⚠️ {message}
      </p>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
      >
        ✕
      </button>
    </div>
  );
}

/* ============================================================
   App Root
   ============================================================ */
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch the /sample endpoint on first load */
  const fetchSample = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/sample`);
      // Merge the sample_player.json stats with the prediction response
      // The /sample endpoint returns prediction fields; we retrieve raw stats from /health first
      // For now, attach static sample stats alongside the prediction
      setData({
        // Raw stats (from sample_player.json — must match what /sample uses)
        kda_ratio: 1.2,
        gold_per_min: 310,
        damage_efficiency: 0.9,
        kill_participation: 0.4,
        vision_control: 0.3,
        death_rate: 0.15,
        cs_per_min: 5.0,
        // Prediction fields
        ...res.data,
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
        'Could not connect to the backend. Make sure the FastAPI server is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /** Predict from form values */
  const handlePredict = useCallback(async (stats) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/predict`, stats);
      setData({ ...stats, ...res.data });
    } catch (err) {
      setError(
        err?.response?.data?.detail ??
        'Prediction failed. Check that the backend is running and your inputs are valid.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSample();
  }, [fetchSample]);

  const defaultFormValues = {
    kda_ratio: 1.2,
    gold_per_min: 310,
    damage_efficiency: 0.9,
    kill_participation: 0.4,
    vision_control: 0.3,
    death_rate: 0.15,
    cs_per_min: 5.0,
  };

  return (
    <>
      {/* Pulse animation for the live indicator dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div className="app-wrapper">
        <Header onRefresh={fetchSample} loading={loading} />

        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {/* Player Input */}
        <PlayerForm onSubmit={handlePredict} loading={loading} defaultValues={defaultFormValues} />

        {/* KPI Stat Cards */}
        <section id="overview-section" aria-label="Performance Overview" style={{ marginBottom: '24px' }}>
          <p className="section-title">Performance Overview</p>
          <Overview data={data} />
        </section>

        {/* Charts */}
        <section id="charts-section" aria-label="Performance Charts" style={{ marginBottom: '24px' }}>
          <p className="section-title">Performance Analysis</p>
          <Charts data={data} />
        </section>

        {/* Playstyle + Insights split */}
        <section id="insights-section" aria-label="Playstyle and Insights" style={{ marginBottom: '40px' }}>
          <p className="section-title">Playstyle &amp; AI Insights</p>
          <div className="grid-2">
            <PlaystyleCard data={data} />
            <InsightPanel insights={data?.insights ?? null} />
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '0.72rem',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          Rift Analytics · Built with FastAPI + XGBoost + React · League of Legends Data Science Portfolio
        </footer>
      </div>
    </>
  );
}
