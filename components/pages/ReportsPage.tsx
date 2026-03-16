
import React, { useState, useCallback } from 'react';
import { LiveData, HistoryData, RiskScores } from '../../types';

interface Props {
  data:    LiveData | null;
  history: HistoryData;
  risks:   RiskScores;
  uptime:  number;
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

// ─── FEATURE 82: CSV Export helper ────────────────────────────────────────────
function exportCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── FEATURE 83: JSON Export helper ───────────────────────────────────────────
function exportJSON(filename: string, data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const fmtUptime = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const ReportsPage: React.FC<Props> = ({ data, history, risks, uptime }) => {
  const [activeReport, setActiveReport] = useState<'daily' | 'stats' | 'risk' | 'compliance'>('daily');
  const [exported, setExported] = useState('');

  const tdsArr  = history.tds;
  const w1Arr   = history.w1;
  const w2Arr   = history.w2;
  const now     = new Date().toLocaleString();

  // ─── FEATURE 85: Session statistics ───────────────────────────────────────────
  const stats = {
    tds:  { avg: tdsArr.length ? Math.round(tdsArr.reduce((a, b) => a + b, 0) / tdsArr.length) : 0, min: tdsArr.length ? Math.round(Math.min(...tdsArr)) : 0, max: tdsArr.length ? Math.round(Math.max(...tdsArr)) : 0, count: tdsArr.length },
    w1:   { avg: w1Arr.length  ? Math.round(w1Arr.reduce((a, b) => a + b, 0)  / w1Arr.length * 10) / 10 : 0, min: w1Arr.length ? Math.round(Math.min(...w1Arr) * 10) / 10 : 0, max: w1Arr.length ? Math.round(Math.max(...w1Arr) * 10) / 10 : 0 },
    w2:   { avg: w2Arr.length  ? Math.round(w2Arr.reduce((a, b) => a + b, 0)  / w2Arr.length * 10) / 10 : 0, min: w2Arr.length ? Math.round(Math.min(...w2Arr) * 10) / 10 : 0, max: w2Arr.length ? Math.round(Math.max(...w2Arr) * 10) / 10 : 0 },
  };

  const whoCompliant = stats.tds.avg <= 500;
  const complianceScore = Math.round(Math.max(0, 100 - (stats.tds.avg / 500) * 40 - risks.flood * 0.3 - risks.composite * 0.3));

  // ─── FEATURE 81: Export TDS CSV ───────────────────────────────────────────────
  const exportTDS = useCallback(() => {
    const rows = [['Index', 'TDS (ppm)'], ...tdsArr.map((v, i) => [String(i + 1), String(Math.round(v))])];
    exportCSV(`geosense_tds_${Date.now()}.csv`, rows);
    setExported('TDS CSV');
    setTimeout(() => setExported(''), 2000);
  }, [tdsArr]);

  // ─── FEATURE 82: Export water levels CSV ──────────────────────────────────────
  const exportWater = useCallback(() => {
    const rows = [['Index', 'Drain W1 (cm)', 'Tank W2 (cm)'], ...w1Arr.map((v, i) => [String(i + 1), String(v.toFixed(1)), String((w2Arr[i] ?? 0).toFixed(1))])];
    exportCSV(`geosense_water_${Date.now()}.csv`, rows);
    setExported('Water CSV');
    setTimeout(() => setExported(''), 2000);
  }, [w1Arr, w2Arr]);

  // ─── FEATURE 83: Export JSON ───────────────────────────────────────────────────
  const exportFullJSON = useCallback(() => {
    exportJSON(`geosense_session_${Date.now()}.json`, {
      exportedAt: now, uptime: fmtUptime(uptime), currentData: data, history, risks, stats,
    });
    setExported('JSON');
    setTimeout(() => setExported(''), 2000);
  }, [data, history, risks, stats, uptime, now]);

  const tabs: { id: typeof activeReport; label: string }[] = [
    { id: 'daily',      label: 'Daily Summary'    },
    { id: 'stats',      label: 'Statistics Report' },
    { id: 'risk',       label: 'Risk Events'       },
    { id: 'compliance', label: 'WHO Compliance'    },
  ];

  return (
    <div className="page">
      {/* ─── Export buttons ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'TDS CSV',    fn: exportTDS,      color: C.blue   },
          { label: 'WATER CSV',  fn: exportWater,    color: C.teal   },
          { label: 'FULL JSON',  fn: exportFullJSON, color: C.green  },
        ].map((btn, i) => (
          <button key={i} onClick={btn.fn} style={{
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: 1,
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
            background: btn.color + '15', color: btn.color,
            border: `1px solid ${btn.color}30`, transition: 'opacity 0.2s',
          }}>
            ↓ {btn.label}
          </button>
        ))}
        {exported && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: C.green, alignSelf: 'center' }}>
            ✓ {exported} exported
          </span>
        )}
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveReport(tab.id)} style={{
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, letterSpacing: 1,
            padding: '8px 16px', cursor: 'pointer', border: 'none',
            background: 'transparent',
            color: activeReport === tab.id ? C.green : 'var(--dim)',
            borderBottom: `2px solid ${activeReport === tab.id ? C.green : 'transparent'}`,
            textTransform: 'uppercase',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ─── FEATURE 84: Daily Summary ── */}
      {activeReport === 'daily' && (
        <div className="card">
          <div className="card-h">
            <div className="card-title">Daily Summary Report</div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>{now}</span>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', marginBottom: 12, lineHeight: 1.8 }}>
              GeoSense Pro · Water Intelligence Node · Session Report
            </div>
            {[
              ['Session Uptime',       fmtUptime(uptime)],
              ['Total Readings',       String(stats.tds.count)],
              ['Current TDS',          data ? `${Math.round(data.tds)} ppm` : 'N/A'],
              ['Average TDS',          `${stats.tds.avg} ppm`],
              ['TDS Min / Max',        `${stats.tds.min} / ${stats.tds.max} ppm`],
              ['Drain W1 Distance',    data && data.w1 >= 0 ? `${data.w1.toFixed(1)} cm` : 'N/A'],
              ['Tank W2 Distance',     data && data.w2 >= 0 ? `${data.w2.toFixed(1)} cm` : 'N/A'],
              ['Flood Risk Score',     `${risks.flood} / 100`],
              ['Composite Risk',       `${risks.composite} / 100`],
              ['WiFi RSSI',            data ? `${Math.round(data.rssi)} dBm` : 'N/A'],
              ['WHO Compliance',       whoCompliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── FEATURE 85: Statistics Report ── */}
      {activeReport === 'stats' && (
        <div className="g2">
          {[
            { title: 'TDS Statistics',          arr: tdsArr, unit: 'ppm',  color: C.blue, data: stats.tds },
            { title: 'Drain W1 Statistics (cm)', arr: w1Arr,  unit: 'cm',   color: C.green, data: stats.w1 },
            { title: 'Tank W2 Statistics (cm)',  arr: w2Arr,  unit: 'cm',   color: C.teal,  data: stats.w2 },
          ].map((s, idx) => (
            <div key={idx} className="card">
              <div className="card-h">
                <div className="card-title">{s.title}</div>
                <span className="badge badge-info">{s.arr.length} PTS</span>
              </div>
              <div className="stat-grid">
                <div className="stat-cell"><div className="sc-label">Average</div><div className="sc-val" style={{ color: s.color }}>{s.data.avg} {s.unit}</div></div>
                <div className="stat-cell"><div className="sc-label">Minimum</div><div className="sc-val c-green">{s.data.min} {s.unit}</div></div>
                <div className="stat-cell"><div className="sc-label">Maximum</div><div className="sc-val" style={{ color: C.red }}>{s.data.max} {s.unit}</div></div>
                <div className="stat-cell"><div className="sc-label">Std Dev</div><div className="sc-val" style={{ color: 'var(--mid)' }}>
                  {s.arr.length > 1 ? Math.round(Math.sqrt(s.arr.reduce((a, b) => a + (b - s.data.avg) ** 2, 0) / s.arr.length) * 10) / 10 : 0} {s.unit}
                </div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── FEATURE 86: Risk Events ── */}
      {activeReport === 'risk' && (
        <div className="card">
          <div className="card-h"><div className="card-title">Risk Event Summary</div></div>
          <div style={{ padding: '14px' }}>
            {[
              { sensor: 'TDS Risk',       score: risks.tds,       level: risks.tds > 66 ? 'CRITICAL' : risks.tds > 33 ? 'WARNING' : 'SAFE' },
              { sensor: 'Flood Risk',     score: risks.flood,     level: risks.flood > 66 ? 'CRITICAL' : risks.flood > 33 ? 'WARNING' : 'SAFE' },
              { sensor: 'Drain Risk',     score: risks.drain,     level: risks.drain > 66 ? 'CRITICAL' : risks.drain > 33 ? 'WARNING' : 'SAFE' },
              { sensor: 'Tank Fill',      score: risks.tank,      level: risks.tank > 90 ? 'CRITICAL' : risks.tank > 70 ? 'WARNING' : 'SAFE' },
              { sensor: 'Composite Risk', score: risks.composite, level: risks.composite > 66 ? 'CRITICAL' : risks.composite > 33 ? 'WARNING' : 'SAFE' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', flex: 1 }}>{r.sensor}</span>
                <div style={{ flex: 2, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.score}%`, background: r.level === 'CRITICAL' ? C.red : r.level === 'WARNING' ? C.yellow : C.green, borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: r.level === 'CRITICAL' ? C.red : r.level === 'WARNING' ? C.yellow : C.green, width: 70, textAlign: 'right' }}>{r.score}/100 {r.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── FEATURE 87: WHO Compliance ── */}
      {activeReport === 'compliance' && (
        <div className="card">
          <div className="card-h">
            <div className="card-title">WHO Compliance Audit</div>
            <span className={`badge ${whoCompliant ? 'badge-safe' : 'badge-danger'}`}>{whoCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</span>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 48, fontWeight: 800, color: complianceScore > 70 ? C.green : complianceScore > 40 ? C.yellow : C.red }}>{complianceScore}</div>
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', marginBottom: 4 }}>OVERALL COMPLIANCE SCORE</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: complianceScore > 70 ? C.green : C.yellow }}>out of 100</div>
              </div>
            </div>
            {[
              { label: 'TDS ≤ 500 ppm (WHO)',       pass: stats.tds.avg <= 500, detail: `Avg ${stats.tds.avg} ppm` },
              { label: 'Flood risk ≤ moderate',     pass: risks.flood <= 66,     detail: `Score ${risks.flood}/100` },
              { label: 'Drain clearance adequate',  pass: risks.drain <= 70,     detail: `Score ${risks.drain}/100` },
              { label: 'Tank not over-filled',      pass: risks.tank <= 90,      detail: `${risks.tank}% fill` },
              { label: 'Composite risk ≤ moderate', pass: risks.composite <= 66, detail: `Score ${risks.composite}/100` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: item.pass ? C.green : C.red }}>{item.pass ? '✓' : '✗'}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)', flex: 1 }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: item.pass ? C.green : C.red }}>{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
