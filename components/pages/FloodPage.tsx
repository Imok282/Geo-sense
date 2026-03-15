
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { LiveData, HistoryData, RiskScores } from '../../types';

interface Props {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

const DRAIN_SCALE = [
  { range: '> 30 cm',    label: 'Dry / Clear',     desc: 'Drain is clear, no flood risk',       color: C.green  },
  { range: '15 – 30 cm', label: 'Normal',           desc: 'Normal water level, monitor',          color: C.blue   },
  { range: '8 – 15 cm',  label: 'Elevated',         desc: 'Water rising, attention needed',       color: C.yellow },
  { range: '3 – 8 cm',   label: 'Near Overflow',    desc: 'Drain close to edge, high alert',      color: '#ff6820' },
  { range: '0 – 3 cm',   label: 'OVERFLOW',         desc: 'Water at/above sensor — emergency',   color: C.red    },
];

const TANK_SCALE = [
  { range: '< 10 %',    label: 'Very Low',         desc: 'Tank nearly empty, refill soon',      color: C.yellow  },
  { range: '10 – 40 %', label: 'Low',              desc: 'Adequate but refill recommended',     color: C.blue    },
  { range: '40 – 70 %', label: 'Normal',           desc: 'Healthy tank level',                  color: C.green   },
  { range: '70 – 90 %', label: 'High',             desc: 'Tank filling up, monitor',            color: C.yellow  },
  { range: '> 90 %',    label: 'Near Full',        desc: 'Near capacity, risk of overflow',     color: C.red     },
];

function drainColor(w1: number) {
  if (w1 < 0)   return 'var(--dim)';
  if (w1 < 3)   return C.red;
  if (w1 < 8)   return '#ff6820';
  if (w1 < 15)  return C.yellow;
  if (w1 < 30)  return C.blue;
  return C.green;
}
function tankColor(pct: number) {
  if (pct > 90) return C.red;
  if (pct > 70) return C.yellow;
  return C.green;
}
function drainAlertClass(w1: number) {
  if (w1 < 0)   return 'as-safe';
  if (w1 < 8)   return 'as-danger';
  if (w1 < 15)  return 'as-warn';
  return 'as-safe';
}
function drainMsg(w1: number) {
  if (w1 < 0)   return 'HC-SR04 #1 not returning echo. Check wiring on GPIO 5 (TRIG) and GPIO 18 (ECHO).';
  if (w1 < 3)   return 'DRAIN OVERFLOW — Water is at or above sensor level. Immediate intervention required.';
  if (w1 < 8)   return 'Drain water level is critically high. Inspect for blockage and initiate drainage protocol.';
  if (w1 < 15)  return 'Water level is elevated. Monitor closely. Clear any debris from drain inlet.';
  if (w1 < 30)  return 'Normal drain clearance. Continue routine monitoring.';
  return 'Drain is clear. No flood risk detected.';
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value} cm</div>
      ))}
    </div>
  );
};

const FloodPage: React.FC<Props> = ({ data, history, risks }) => {
  const w1   = data?.w1 ?? -1;
  const w2   = data?.w2 ?? -1;
  const tank = w2 >= 0 ? Math.max(0, Math.min(100, Math.round((1 - w2 / 100) * 100))) : null;

  const dc = drainColor(w1);
  const tc = tank !== null ? tankColor(tank) : C.teal;

  // Chart data
  const mkData = (arr: number[]) => arr.map((v, i) => ({ i, v: parseFloat(v.toFixed(1)) }));
  const combinedData = history.w1.map((v, i) => ({
    i,
    drain: parseFloat(v.toFixed(1)),
    tank:  parseFloat((history.w2[i] ?? 50).toFixed(1)),
  }));

  // Drain band index
  const drainBand = w1 < 0 ? -1 : w1 < 3 ? 4 : w1 < 8 ? 3 : w1 < 15 ? 2 : w1 < 30 ? 1 : 0;
  const tankBand  = tank === null ? -1 : tank > 90 ? 4 : tank > 70 ? 3 : tank > 40 ? 2 : tank > 10 ? 1 : 0;

  return (
    <div className="page">
      {/* Alert strip */}
      <div className={`alert-strip ${drainAlertClass(w1)}`}>
        <span>≉</span>
        <span>{drainMsg(w1)}</span>
      </div>

      {/* ── Row 1: Drain + Tank big readings ── */}
      <div className="g2 mt">

        {/* HC-SR04 #1 — Drain */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">≉ Drain Overflow — HC-SR04 #1</div>
            <span className="badge" style={{ color: dc, background: `${dc}15`, border: `1px solid ${dc}30` }}>
              {w1 < 0 ? 'NO ECHO' : w1 < 3 ? 'OVERFLOW' : w1 < 8 ? 'CRITICAL' : w1 < 15 ? 'ELEVATED' : 'CLEAR'}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: dc }}>{w1 >= 0 ? w1.toFixed(1) : '--'}</span>
            <span className="bn-unit">cm</span>
            <div className="bn-label">Distance to water surface · TRIG GPIO 5 / ECHO GPIO 18</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: dc }} />
              <span className="status-txt" style={{ color: dc }}>
                {risks.drain} / 100 FLOOD RISK
              </span>
            </div>
          </div>
          <div className="chart-box short">
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart data={mkData(history.w1)} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-drain-pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" name="Drain" stroke={C.blue} fill="url(#g-drain-pg)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Drain scale */}
          <div className="hscale" style={{ borderTop: '1px solid var(--border)' }}>
            {DRAIN_SCALE.map((row, i) => (
              <div key={i} className={`hs-row${i === drainBand ? ' active' : ''}`}>
                <div className="hs-dot" style={{ background: row.color }} />
                <div className="hs-range">{row.range}</div>
                <div className="hs-label" style={{ color: i === drainBand ? row.color : 'var(--mid)' }}>{row.label}</div>
                <div className="hs-impact">{row.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HC-SR04 #2 — Tank */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">≉ Tank Level — HC-SR04 #2</div>
            <span className="badge" style={{ color: tc, background: `${tc}15`, border: `1px solid ${tc}30` }}>
              {tank === null ? 'NO ECHO' : tank > 90 ? 'NEAR FULL' : tank > 70 ? 'HIGH' : tank > 40 ? 'NORMAL' : tank > 10 ? 'LOW' : 'VERY LOW'}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: tc }}>{tank !== null ? tank : '--'}</span>
            <span className="bn-unit">%</span>
            <div className="bn-label">Tank fill · raw dist {w2 >= 0 ? `${w2.toFixed(1)} cm` : '--'} · TRIG GPIO 19 / ECHO GPIO 23</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: tc }} />
              <span className="status-txt" style={{ color: tc }}>
                {risks.tank} % FILL LEVEL
              </span>
            </div>
          </div>
          <div className="chart-box short">
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart data={history.w2.map((v, i) => ({ i, v: Math.max(0, Math.min(100, Math.round((1 - v / 100) * 100))) }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-tank-pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.teal} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.teal} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" name="Tank %" stroke={C.teal} fill="url(#g-tank-pg)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tank scale */}
          <div className="hscale" style={{ borderTop: '1px solid var(--border)' }}>
            {TANK_SCALE.map((row, i) => (
              <div key={i} className={`hs-row${i === tankBand ? ' active' : ''}`}>
                <div className="hs-dot" style={{ background: row.color }} />
                <div className="hs-range">{row.range}</div>
                <div className="hs-label" style={{ color: i === tankBand ? row.color : 'var(--mid)' }}>{row.label}</div>
                <div className="hs-impact">{row.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Combined chart ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">Water Distance Trend — Both Sensors</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge" style={{ background: `${C.blue}15`, color: C.blue, border: `1px solid ${C.blue}30` }}>DRAIN</span>
            <span className="badge" style={{ background: `${C.teal}15`, color: C.teal, border: `1px solid ${C.teal}30` }}>TANK</span>
          </div>
        </div>
        <div className="chart-box tall">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={combinedData} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="g-cd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="g-ct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.teal} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis hide />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={8}  stroke={C.red}    strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'OVERFLOW ≤8cm', position: 'right', fontSize: 8, fill: C.red,    fontFamily: 'monospace' }} />
              <ReferenceLine y={15} stroke={C.yellow} strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'WARNING ≤15cm',  position: 'right', fontSize: 8, fill: C.yellow, fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="drain" name="Drain (cm)" stroke={C.blue} fill="url(#g-cd)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="tank"  name="Tank (cm)"  stroke={C.teal} fill="url(#g-ct)"  strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Composite flood breakdown + recommendations ── */}
      <div className="g2 mt">

        {/* Flood composite */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Composite Flood Score</div>
            <span className="badge" style={{ color: risks.flood > 66 ? C.red : risks.flood > 33 ? C.yellow : C.green, background: `${risks.flood > 66 ? C.red : risks.flood > 33 ? C.yellow : C.green}15`, border: `1px solid ${risks.flood > 66 ? C.red : risks.flood > 33 ? C.yellow : C.green}30` }}>
              {risks.flood} / 100
            </span>
          </div>
          <div className="card-b">
            <div className="axis-table">
              <div className="at-row">
                <div className="at-axis" style={{ width: 38, fontSize: 8 }}>DRAIN</div>
                <div className="at-bar">
                  <div className="at-fill" style={{ width: `${risks.drain}%`, background: risks.drain > 66 ? C.red : risks.drain > 33 ? C.yellow : C.blue }} />
                </div>
                <div className="at-val" style={{ color: risks.drain > 66 ? C.red : risks.drain > 33 ? C.yellow : C.blue }}>
                  ×70% = {Math.round(risks.drain * 0.7)}
                </div>
              </div>
              <div className="at-row">
                <div className="at-axis" style={{ width: 38, fontSize: 8 }}>TANK</div>
                <div className="at-bar">
                  <div className="at-fill" style={{ width: `${risks.tank}%`, background: risks.tank > 90 ? C.red : risks.tank > 70 ? C.yellow : C.teal }} />
                </div>
                <div className="at-val" style={{ color: risks.tank > 90 ? C.red : risks.tank > 70 ? C.yellow : C.teal }}>
                  ×30% = {Math.round(risks.tank * 0.3)}
                </div>
              </div>
            </div>
            <div className="insight" style={{ borderColor: risks.flood > 66 ? C.red : risks.flood > 33 ? C.yellow : C.green }}>
              <div className="insight-title" style={{ color: risks.flood > 66 ? C.red : risks.flood > 33 ? C.yellow : C.green }}>
                Formula: Flood = (Drain×70%) + (Tank×30%)
              </div>
              <div className="insight-body">
                Drain proximity is weighted 70% because overflow at the drain point is a direct flood indicator.
                Tank level contributes 30% — a full tank combined with heavy rain increases overflow probability.
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Action Recommendations</div>
          </div>
          <div className="rec-list">
            {risks.flood < 33 && (
              <>
                <div className="rec-item">
                  <div className="rec-icon">✓</div>
                  <div className="rec-text"><strong>No immediate action required.</strong> Both drain and tank levels are within safe ranges. Continue standard monitoring protocol.</div>
                </div>
                <div className="rec-item">
                  <div className="rec-icon">📅</div>
                  <div className="rec-text"><strong>Schedule preventive maintenance.</strong> Inspect drain channels and tank seals monthly. Remove accumulated debris before monsoon season.</div>
                </div>
              </>
            )}
            {risks.flood >= 33 && risks.flood < 66 && (
              <>
                <div className="rec-item">
                  <div className="rec-icon">⚠</div>
                  <div className="rec-text"><strong>Moderate flood risk detected.</strong> {w1 >= 0 && w1 < 15 && <><strong>Drain at {w1.toFixed(1)} cm</strong> — water level is elevated. </>}Inspect drain inlet for blockage and clear if needed.</div>
                </div>
                <div className="rec-item">
                  <div className="rec-icon">🔧</div>
                  <div className="rec-text"><strong>Check drainage outlets.</strong> Ensure all secondary outlets are clear and functional. Test sump pump if installed.</div>
                </div>
              </>
            )}
            {risks.flood >= 66 && (
              <>
                <div className="rec-item">
                  <div className="rec-icon">🚨</div>
                  <div className="rec-text"><strong>HIGH FLOOD RISK — Immediate action required.</strong> {w1 >= 0 && w1 < 8 && <><strong>Drain at {w1.toFixed(1)} cm</strong> — critical proximity. </>}Initiate emergency drainage protocol now.</div>
                </div>
                <div className="rec-item">
                  <div className="rec-icon">📢</div>
                  <div className="rec-text"><strong>Alert facility management.</strong> Notify maintenance team and relevant stakeholders. Prepare for potential water damage to nearby areas.</div>
                </div>
                <div className="rec-item">
                  <div className="rec-icon">📸</div>
                  <div className="rec-text"><strong>Document the incident.</strong> Capture timestamps, sensor readings and photographs for insurance and post-event analysis.</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodPage;
