
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props { simTick?: number; }

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', orange: '#ff6820', teal: '#14b8a6', purple: '#a855f7', dim: '#182430', s2: '#0d1419' };

// ─── FEATURE 49: Richter Magnitude Estimate from g-force ─────────────────────
function estimateRichter(g: number): number {
  // Simplified empirical formula: M ≈ log10(a * 1000) + 1.5 (rough estimate)
  if (g < 0.0001) return 0;
  return Math.round((Math.log10(g * 1000) + 1.5) * 10) / 10;
}

// ─── FEATURE 54: Modified Mercalli Intensity ─────────────────────────────────
function mercalliScale(g: number): { level: string; color: string; desc: string } {
  if (g < 0.001)  return { level: 'I — Not Felt',           color: C.green,  desc: 'Imperceptible. Only detectable by instruments.' };
  if (g < 0.003)  return { level: 'II — Barely Felt',       color: C.teal,   desc: 'Felt by very few people at rest on upper floors.' };
  if (g < 0.01)   return { level: 'III — Weak',             color: C.blue,   desc: 'Felt indoors by some. Like passing truck.' };
  if (g < 0.03)   return { level: 'IV — Light',             color: C.yellow, desc: 'Felt indoors by many. Windows rattle.' };
  if (g < 0.1)    return { level: 'V — Moderate',           color: C.orange, desc: 'Felt by nearly all. Small objects displaced.' };
  if (g < 0.3)    return { level: 'VI — Strong',            color: C.red,    desc: 'Felt by all. Some damage to structures.' };
  return          { level: 'VII+ — Very Strong / Violent',  color: '#c026d3', desc: 'Major damage. Structural failure possible.' };
}

// ─── FEATURE 57: Background noise level ──────────────────────────────────────
function noiseCategory(g: number): { label: string; color: string } {
  if (g < 0.001) return { label: 'SILENT',      color: C.green };
  if (g < 0.005) return { label: 'QUIET',       color: C.teal };
  if (g < 0.02)  return { label: 'AMBIENT',     color: C.blue };
  if (g < 0.08)  return { label: 'NOISY',       color: C.yellow };
  return         { label: 'LOUD / EVENT', color: C.red };
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

const SeismicPage: React.FC<Props> = ({ simTick = 0 }) => {
  const t = simTick * 0.08;

  // Simulated MPU6050 + ADXL345 seismic values
  const accelX    = Math.round(Math.abs(0.005 + Math.sin(t * 1.8) * 0.012 + (Math.random() - 0.5) * 0.003) * 10000) / 10000;
  const accelY    = Math.round(Math.abs(0.004 + Math.sin(t * 1.4) * 0.010 + (Math.random() - 0.5) * 0.003) * 10000) / 10000;
  const accelZ    = Math.round(Math.abs(0.003 + Math.sin(t * 1.1) * 0.008 + (Math.random() - 0.5) * 0.002) * 10000) / 10000;
  const magnitude = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);
  const magRound  = Math.round(magnitude * 10000) / 10000;

  // ─── FEATURE 49: Richter estimate ─────────────────────────────────────────────
  const richter = estimateRichter(magnitude);
  // ─── FEATURE 54: Mercalli intensity ───────────────────────────────────────────
  const mmi     = mercalliScale(magnitude);
  // ─── FEATURE 55: Background noise ─────────────────────────────────────────────
  const noise   = noiseCategory(magnitude);

  // ─── FEATURE 50: Ground motion vector ─────────────────────────────────────────
  const motionVector = {
    x: accelX,
    y: accelY,
    z: accelZ,
    resultant: magRound,
  };

  // ─── FEATURE 60: Historical event timeline ────────────────────────────────────
  const [events] = useState([
    { time: '15:41:22', mag: 0.0082, richter: 1.2, mmi: 'III — Weak' },
    { time: '14:15:08', mag: 0.0051, richter: 0.9, mmi: 'II — Barely Felt' },
    { time: '12:33:44', mag: 0.0210, richter: 1.9, mmi: 'IV — Light' },
    { time: '09:11:02', mag: 0.0031, richter: 0.6, mmi: 'II — Barely Felt' },
    { time: 'Yesterday', mag: 0.0415, richter: 2.4, mmi: 'V — Moderate' },
  ]);

  // ─── FEATURE 58: Event frequency counter ──────────────────────────────────────
  const eventCount = events.length;
  const highEvents = events.filter(e => e.richter >= 2).length;

  // Ground motion history
  const seismicHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    i,
    x: Math.round(Math.abs(0.005 + Math.sin(i * 1.5) * 0.008 + (Math.random() - 0.5) * 0.003) * 10000) / 10000,
    y: Math.round(Math.abs(0.004 + Math.sin(i * 1.2) * 0.006 + (Math.random() - 0.5) * 0.002) * 10000) / 10000,
  })), []);

  // ─── FEATURE 59: Seismic risk zone indicator ──────────────────────────────────
  const riskZone = richter < 2 ? { label: 'LOW SEISMIC ZONE', color: C.green } : richter < 3 ? { label: 'MODERATE SEISMIC ZONE', color: C.yellow } : { label: 'HIGH SEISMIC ZONE', color: C.red };

  return (
    <div className="page">
      <div className={`alert-strip ${magnitude < 0.01 ? 'as-safe' : magnitude < 0.05 ? 'as-warn' : 'as-danger'}`}>
        <span>⏚</span>
        <span>{mmi.level} — Magnitude {magRound}g · Richter Est. {richter} · {mmi.desc}</span>
      </div>

      {/* ── Row 1: 4 key metrics ── */}
      <div className="g4 mt">
        {/* Magnitude */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⏚ Magnitude</div>
            <span className="badge" style={{ color: mmi.color, background: `${mmi.color}15`, border: `1px solid ${mmi.color}30` }}>{noise.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: mmi.color }}>{magRound}</span>
            <span className="bn-unit">g</span>
            <div className="bn-label">Ground motion resultant vector</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: mmi.color }} />
              <span className="status-txt" style={{ color: mmi.color }}>Events: {eventCount} today</span>
            </div>
          </div>
        </div>

        {/* ─── FEATURE 49: Richter estimate ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⏚ Richter Scale</div>
            <span className="badge" style={{ color: riskZone.color, background: `${riskZone.color}15`, border: `1px solid ${riskZone.color}30` }}>{riskZone.label}</span>
          </div>
          <div className="composite" style={{ padding: '16px 14px' }}>
            <div className="comp-num" style={{ fontSize: 52, color: mmi.color }}>{richter}</div>
            <div className="comp-label">Estimated Richter</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginTop: 4 }}>Empirical estimate from g-force</div>
          </div>
        </div>

        {/* ─── FEATURE 54: MMI ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⏚ Mercalli Intensity</div>
            <span className="badge badge-info">MMI</span>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: mmi.color, fontWeight: 700, marginBottom: 8 }}>{mmi.level}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)', lineHeight: 1.6 }}>{mmi.desc}</div>
            <div style={{ marginTop: 12, fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>
              High events (M≥2): <span style={{ color: highEvents > 0 ? C.yellow : C.green }}>{highEvents}</span>
            </div>
          </div>
        </div>

        {/* ─── FEATURE 50: Ground motion vector ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⏚ Motion Vector</div>
            <span className="badge badge-info">3-AXIS</span>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { axis: 'X-AXIS', val: motionVector.x, color: C.red    },
              { axis: 'Y-AXIS', val: motionVector.y, color: C.green  },
              { axis: 'Z-AXIS', val: motionVector.z, color: C.blue   },
              { axis: 'RESULT', val: motionVector.resultant, color: mmi.color },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>{a.axis}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: a.color, fontWeight: 700 }}>{a.val} g</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Seismic waveform chart ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">⏚ Seismic Waveform — X & Y Axes (30 Readings)</div>
          <span className="badge badge-info">MPU6050 + ADXL345</span>
        </div>
        <div className="chart-box tall">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={seismicHistory} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="g-sx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="g-sy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis domain={[0, 0.03]} hide />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={0.01} stroke={C.yellow} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'MINOR 0.01g', position: 'right', fontSize: 8, fill: C.yellow, fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="x" name="X-Axis (g)" stroke={C.red}  fill="url(#g-sx)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="y" name="Y-Axis (g)" stroke={C.blue} fill="url(#g-sy)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Event timeline + Recommendations ── */}
      <div className="g2 mt">
        {/* ─── FEATURE 60: Event timeline ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⏚ Event Timeline</div>
            <span className="badge badge-warn">{eventCount} EVENTS</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', width: 65, flexShrink: 0 }}>{ev.time}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)', flex: 1 }}>{ev.mmi}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: ev.richter >= 2 ? C.yellow : C.green, fontWeight: 700 }}>M{ev.richter}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FEATURE 59: Risk zone + Recommendations ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Seismic Risk Advisory</div>
          </div>
          <div className="rec-list">
            <div className="rec-item">
              <div className="rec-icon" style={{ color: riskZone.color }}>⏚</div>
              <div className="rec-text"><strong>{riskZone.label}.</strong> Current measured Richter estimate: M{richter}. {richter < 2 ? 'Microseismic activity is within normal background levels.' : 'Activity elevated above background. Log and monitor for 24h.'}</div>
            </div>
            <div className="rec-item">
              <div className="rec-icon" style={{ color: C.blue }}>📡</div>
              <div className="rec-text"><strong>Sensor mounting:</strong> Ensure MPU6050 and ADXL345 are rigidly mounted to structural element — not on foam or rubber. Loose mounting creates false readings.</div>
            </div>
            {richter >= 3 && (
              <div className="rec-item">
                <div className="rec-icon" style={{ color: C.red }}>🚨</div>
                <div className="rec-text"><strong>Significant seismic event detected.</strong> Cross-reference with USGS real-time earthquake feed. Inspect all structural connections and anchor points.</div>
              </div>
            )}
            <div className="rec-item">
              <div className="rec-icon" style={{ color: C.green }}>✓</div>
              <div className="rec-text"><strong>Background noise:</strong> {noise.label}. {noise.label === 'SILENT' || noise.label === 'QUIET' ? 'Ideal baseline for seismic monitoring.' : 'Elevated ambient noise may affect detection sensitivity. Check for nearby machinery.'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeismicPage;
