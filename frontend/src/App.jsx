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
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingBottom: '24px',
      borderBottom: '1px solid var(--clr-border)',
      marginBottom: '32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'var(--clr-panel)',
          border: '2px solid var(--clr-border-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 16px rgba(200, 170, 110, 0.2)',
        }}>
          <span style={{ transform: 'rotate(-45deg)', filter: 'drop-shadow(0 0 4px var(--clr-cyan))' }}>⚡</span>
        </div>
        <div style={{ paddingLeft: '8px' }}>
          <h1 className="font-epic" style={{
            fontSize: '1.8rem',
            color: 'var(--clr-gold)',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)'
          }}>
            Rift Analytics
          </h1>
          <p className="font-tech" style={{ color: 'var(--clr-cyan)', fontSize: '0.85rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            ML-Powered Performance Dashboard
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="font-tech" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--sev-low)',
          padding: '4px 12px',
          background: 'rgba(0, 191, 165, 0.1)',
          border: '1px solid rgba(0, 191, 165, 0.3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--sev-low)', animation: 'pulse 2s infinite' }} />
          Live Server
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="font-tech"
          style={{
            padding: '6px 16px',
            border: '1px solid var(--clr-border-gold)',
            background: 'rgba(200, 170, 110, 0.1)',
            color: 'var(--clr-gold-accent)',
            fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all var(--dur)',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(200, 170, 110, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200, 170, 110, 0.1)'; }}
        >
          {loading ? 'Fetching...' : 'Re-Sync'}
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
    kda_ratio: 1.2, gold_per_min: 310, damage_efficiency: 0.9,
    kill_participation: 0.4, vision_control: 0.3, death_rate: 0.15, cs_per_min: 5.0,
  });

  const handleChange = (key, val) => setValues((p) => ({ ...p, [key]: parseFloat(val) || 0 }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(values); };

  const fields = [
    { key: 'kda_ratio',          label: 'KDA Ratio',          hint: '(K+A)/D',       step: 0.1, min: 0, max: 30  },
    { key: 'gold_per_min',       label: 'Gold / Min',         hint: 'GPM',           step: 10,  min: 0, max: 800  },
    { key: 'damage_efficiency',  label: 'Damage Efficiency',  hint: 'Dmg/Gold',      step: 0.05,min: 0, max: 5    },
    { key: 'kill_participation', label: 'Kill Particip.',     hint: '0-1 Ratio',     step: 0.01,min: 0, max: 1    },
    { key: 'vision_control',     label: 'Vision Score',       hint: 'per min',       step: 0.05,min: 0, max: 5    },
    { key: 'death_rate',         label: 'Death Rate',         hint: 'Deaths/min',    step: 0.01,min: 0, max: 1    },
    { key: 'cs_per_min',         label: 'CS / Min',           hint: 'Creep Score',   step: 0.5, min: 0, max: 15   },
  ];

  return (
    <div className="hextech-panel fade-up" style={{ marginBottom: '24px' }}>
      <p className="card-title">Match Telemetry Input</p>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {fields.map(({ key, label, hint, step, min, max }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="font-tech" style={{ fontSize: '0.75rem', color: 'var(--clr-gold-accent)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label} <span style={{ color: 'var(--txt-muted)' }}>[{hint}]</span>
              </label>
              <input
                type="number" step={step} min={min} max={max} value={values[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="font-mono"
                style={{
                  padding: '8px 10px',
                  background: '#010a13',
                  border: '1px solid var(--clr-border)',
                  color: 'var(--clr-cyan)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color var(--dur)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--clr-cyan)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(10,200,185,0.2)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="font-epic"
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--clr-panel)',
            border: '2px solid var(--clr-border-gold)',
            color: 'var(--clr-gold)',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8), 0 0 15px rgba(200, 170, 110, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'rgba(200, 170, 110, 0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(200, 170, 110, 0.3)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--clr-panel)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.8), 0 0 15px rgba(200, 170, 110, 0.1)'; }}
        >
          {loading ? 'Processing Model...' : 'Lock In & Analyse'}
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
    <div className="font-tech" style={{
      background: 'rgba(209, 54, 57, 0.1)',
      border: '1px solid var(--sev-high)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      color: 'var(--sev-high)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      <span>⚠️ SYSTEM ERR: {message}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'var(--sev-high)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
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

  const defaultFormValues = {
    kda_ratio: 1.2, gold_per_min: 310, damage_efficiency: 0.9,
    kill_participation: 0.4, vision_control: 0.3, death_rate: 0.15, cs_per_min: 5.0,
  };

  const fetchSample = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_BASE}/sample`);
      setData({ ...defaultFormValues, ...res.data });
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Connection to Rift Analytics backend failed.');
    } finally { setLoading(false); }
  }, []);

  const handlePredict = useCallback(async (stats) => {
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API_BASE}/predict`, stats);
      setData({ ...stats, ...res.data });
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Prediction pipeline error.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSample(); }, [fetchSample]);

  return (
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div className="app-wrapper">
        <Header onRefresh={fetchSample} loading={loading} />
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <PlayerForm onSubmit={handlePredict} loading={loading} defaultValues={defaultFormValues} />

        <section style={{ marginBottom: '24px' }}>
          <p className="section-title">Performance Overview</p>
          <Overview data={data} />
        </section>

        <section style={{ marginBottom: '24px' }}>
          <p className="section-title">Combat & Objective Analysis</p>
          <Charts data={data} />
        </section>

        <section style={{ marginBottom: '40px' }}>
          <p className="section-title">Playstyle & Coaching</p>
          <div className="grid-2">
            <PlaystyleCard data={data} />
            <InsightPanel insights={data?.insights ?? null} />
          </div>
        </section>

        <footer className="font-tech" style={{
          textAlign: 'center',
          color: 'var(--txt-muted)',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          paddingTop: '24px',
          borderTop: '1px solid var(--clr-border)',
        }}>
          Rift Analytics Model Endpoint // Authenticated
        </footer>
      </div>
    </>
  );
}
