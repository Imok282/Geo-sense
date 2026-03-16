
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { PageId, computeRisks } from '../../App';

interface Props {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
  onNavigate: (p: PageId) => void;
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)' }}>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function scoreColor(s: number) { return s > 66 ? C.red : s > 33 ? C.yellow : C.green; }
function scoreLevel(s: number) { return s > 66 ? 'DANGER' : s > 33 ? 'MODERATE' : 'SAFE'; }
function compositeStatus(s: number) { return s > 66 ? 'HIGH RISK' : s > 33 ? 'MODERATE RISK' : 'ALL CLEAR'; }

// ─── RISK OVERVIEW CARD ───────────────────────────────────────────────────────
const RoCard = ({
  icon, name, score, color, level, onClick, offline,
}: {
  icon: string; name: string; score: number; color: string; level: string;
  onClick?: () => void; offline?: boolean;
}) => (
  <div className="ro-card" onClick={onClick}>
    <div className="ro-icon">{icon}</div>
    <div className="ro-name">{name}</div>
    <div className="ro-score" style={{ color: offline ? 'var(--dim)' : color }}>
      {offline ? 'N/A' : score}
    </div>
    <div className="ro-level" style={{ color: offline ? 'var(--dim)' : color }}>
      {offline ? 'OFFLINE' : level}
    </div>
  </div>
);

// ─── RING GAUGE ───────────────────────────────────────────────────────────────
const Ring = ({ score, color }: { score: number; color: string }) => {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="ring-container">
      <svg className="ring-svg" viewBox="0 0 110 110">
        <circle className="ring-bg" cx="55" cy="55" r={r} />
        <circle
          className="ring-fill"
          cx="55" cy="55" r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div className="ring-c">
        <div className="ring-num" style={{ color }}>{score}</div>
        <div className="ring-lbl">/ 100</div>
      </div>
    </div>
  );
};

// ─── RISK RADAR PAGE ──────────────────────────────────────────────────────────
const RiskRadarPage: React.FC<Props> = ({ data, history, risks, onNavigate }) => {
  // Compute composite history from raw history arrays
  const compositeHist = history.tds.map((tds, i) => {
    const w1  = history.w1[i] ?? 20;
    const w2  = history.w2[i] ?? 50;
    const r   = computeRisks({ tds, w1, w2, uptime: 0, rssi: 0 });
    return { i, v: r.composite };
  });

  const compColor  = scoreColor(risks.composite);
  const floodColor = scoreColor(risks.flood);
  const tdsColor   = scoreColor(risks.tds);

  // ─── FEATURE 116: Risk trend prediction ────────────────────────────────────
  const histLen = compositeHist.length;
  const predictedRisk = histLen >= 3
    ? Math.max(0, Math.min(100, Math.round(
        compositeHist[histLen - 1].v +
        (compositeHist[histLen - 1].v - compositeHist[histLen - 3].v) / 2
      )))
    : risks.composite;

  // ─── FEATURE 117: Historical max ───────────────────────────────────────────
  const histMax = compositeHist.length ? Math.max(...compositeHist.map(d => d.v)) : 0;
  const histAvg = compositeHist.length
    ? Math.round(compositeHist.reduce((a, b) => a + b.v, 0) / compositeHist.length)
    : 0;

  // ─── FEATURE 118: Delta change ─────────────────────────────────────────────
  const delta = compositeHist.length >= 2
    ? compositeHist[compositeHist.length - 1].v - compositeHist[compositeHist.length - 2].v
    : 0;
  const deltaLabel = delta > 0 ? `↑ +${delta}` : delta < 0 ? `↓ ${delta}` : '→ 0';
  const deltaColor = delta > 5 ? C.red : delta > 0 ? C.yellow : delta < 0 ? C.green : C.teal;

  // ─── FEATURE 119: Risk percentile ──────────────────────────────────────────
  const percentile = compositeHist.length
    ? Math.round((compositeHist.filter(d => d.v <= risks.composite).length / compositeHist.length) * 100)
    : 50;

  return (
    <div className="page">
      {/* ── ROW 1: Composite + Risk Cards ── */}
      <div className="g12">

        {/* Composite score */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Composite Risk Score</div>
          </div>
          <div className="composite">
            <div className="comp-num" style={{ color: compColor }}>{risks.composite}</div>
            <div className="comp-label">Out of 100</div>
            <div className="comp-status" style={{ color: compColor }}>
              {compositeStatus(risks.composite)}
            </div>
          </div>
          <div style={{ padding: '0 14px 16px' }}>
            <Ring score={risks.composite} color={compColor} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', textAlign: 'center', marginTop: 8 }}>
              LIVE · 2 ACTIVE SENSORS
            </div>
          </div>
        </div>

        {/* 5 risk category cards */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Real-Time Heuristic Scan</div>
            <span className="badge badge-info">5 MODULES</span>
          </div>
          <div className="risk-overview">
            <RoCard icon="∿" name="Heat"      score={0}           color={C.dim}    level="SAFE"    offline onClick={() => onNavigate('heat')} />
            <RoCard icon="≉" name="Flood"     score={risks.flood} color={floodColor} level={scoreLevel(risks.flood)} onClick={() => onNavigate('flood')} />
            <RoCard icon="⚑" name="Air"       score={0}           color={C.dim}    level="SAFE"    offline onClick={() => onNavigate('air')} />
            <RoCard icon="⏚" name="Seismic"   score={0}           color={C.dim}    level="SAFE"    offline onClick={() => onNavigate('seismic')} />
            <RoCard icon="⚗" name="Water"     score={risks.tds}   color={tdsColor}  level={scoreLevel(risks.tds)}   onClick={() => onNavigate('tds')} />
          </div>
        </div>
      </div>

      {/* ── ROW 2: Composite trend ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">Composite Risk Trend</div>
          <span className="badge badge-info">{compositeHist.length} pts</span>
        </div>
        <div className="chart-box tall">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={compositeHist} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="g-comp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={compColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={compColor} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="v" name="Risk Score" stroke={compColor} fill="url(#g-comp)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Reference lines */}
          <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 1, background: C.yellow, opacity: 0.6 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>MODERATE ≥34</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 1, background: C.red, opacity: 0.6 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>HIGH ≥67</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Active risk breakdown ── */}
      <div className="g2 mt">

        {/* Flood breakdown */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">≉ Flood Risk Breakdown</div>
            <span className="badge" style={{ color: floodColor, background: `${floodColor}15`, border: `1px solid ${floodColor}30` }}>
              {risks.flood} / 100
            </span>
          </div>
          <div className="axis-table">
            <div className="at-row">
              <div className="at-axis">DR</div>
              <div className="at-bar">
                <div className="at-fill" style={{ width: `${risks.drain}%`, background: risks.drain > 66 ? C.red : risks.drain > 33 ? C.yellow : C.blue }} />
              </div>
              <div className="at-val" style={{ color: risks.drain > 66 ? C.red : risks.drain > 33 ? C.yellow : C.blue }}>
                {risks.drain} / 100
              </div>
            </div>
            <div className="at-row">
              <div className="at-axis">TK</div>
              <div className="at-bar">
                <div className="at-fill" style={{ width: `${risks.tank}%`, background: risks.tank > 90 ? C.red : risks.tank > 70 ? C.yellow : C.teal }} />
              </div>
              <div className="at-val" style={{ color: risks.tank > 90 ? C.red : risks.tank > 70 ? C.yellow : C.teal }}>
                {risks.tank} %
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="insight" style={{ borderColor: floodColor, margin: '6px 0 0 0' }}>
                <div className="insight-title" style={{ color: floodColor }}>Flood Formula</div>
                <div className="insight-body">
                  Flood = (Drain × 70%) + (Tank × 30%). Drain proximity is weighted more heavily as it indicates immediate overflow risk.
                  {data && data.w1 >= 0 && (
                    <><br /><strong>Drain dist: {data.w1.toFixed(1)} cm</strong> — {data.w1 < 5 ? 'Critical: water at sensor' : data.w1 < 15 ? 'Warning: rising water' : 'Safe clearance'}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TDS / Water breakdown */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚗ Water Quality Breakdown</div>
            <span className="badge" style={{ color: tdsColor, background: `${tdsColor}15`, border: `1px solid ${tdsColor}30` }}>
              {risks.tds} / 100
            </span>
          </div>
          <div className="axis-table">
            <div className="at-row">
              <div className="at-axis">TDS</div>
              <div className="at-bar">
                <div className="at-fill" style={{ width: `${risks.tds}%`, background: tdsColor }} />
              </div>
              <div className="at-val" style={{ color: tdsColor }}>
                {data ? `${Math.round(data.tds)} ppm` : '--'}
              </div>
            </div>
            <div className="at-row">
              <div className="at-axis">WHO</div>
              <div className="at-bar">
                <div className="at-fill" style={{ width: '100%', background: C.dim }} />
              </div>
              <div className="at-val" style={{ color: 'var(--dim)' }}>500 ppm</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="insight" style={{ borderColor: tdsColor, margin: '6px 0 0 0' }}>
                <div className="insight-title" style={{ color: tdsColor }}>TDS Interpretation</div>
                <div className="insight-body">
                  TDS risk = (reading / 500) × 100. WHO guideline for drinking water: ≤500 ppm.
                  Readings 300–500 ppm are borderline; above 500 ppm is non-compliant.
                  {data && (
                    <><br /><strong>Current: {Math.round(data.tds)} ppm</strong> — {data.tds < 150 ? 'Excellent quality' : data.tds < 300 ? 'Good quality' : data.tds < 500 ? 'Borderline' : 'Non-compliant'}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FEATURE 116-120: Risk analytics panel ── */}
      <div className="g4 mt">
        {[
          { label: 'PREDICTED NEXT',  value: predictedRisk, unit: '/100',  color: scoreColor(predictedRisk), desc: '1-reading forecast' },
          { label: 'SESSION MAX',     value: histMax,        unit: '/100',  color: scoreColor(histMax),       desc: 'Historical peak' },
          { label: 'SESSION AVG',     value: histAvg,        unit: '/100',  color: scoreColor(histAvg),       desc: 'Mean composite' },
          { label: 'DELTA',           value: deltaLabel,     unit: '',      color: deltaColor,                desc: 'Last reading change' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div style={{ padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}<span style={{ fontSize: 10, fontWeight: 400 }}>{s.unit}</span></div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', marginTop: 4 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── FEATURE 119: Percentile + threshold link ── */}
      <div className="g2 mt">
        <div className="alert-strip as-safe" style={{ margin: 0 }}>
          <span>◎</span>
          <span>Current risk {risks.composite}/100 is at the <strong>{percentile}th percentile</strong> of this session's readings. {percentile < 50 ? 'Better than average session conditions.' : 'Above average session risk level.'}</span>
        </div>
        {/* ─── FEATURE 120: Threshold config quick link ── */}
        <div className="alert-strip" style={{ margin: 0, borderColor: 'var(--dim)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => onNavigate('alerts')}>
          <span>⛭</span>
          <span>Configure alert thresholds and notification rules in <strong>Alert Center</strong>. Current: TDS warn ≥300 ppm, Flood warn ≥50/100.</span>
        </div>
      </div>
    </div>
  );
};

export default RiskRadarPage;
