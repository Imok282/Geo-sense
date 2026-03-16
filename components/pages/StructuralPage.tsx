
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props { simTick?: number; }

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', orange: '#ff6820', teal: '#14b8a6', purple: '#a855f7', dim: '#182430', s2: '#0d1419' };

// ─── FEATURE 25: Vibration Intensity Scale ────────────────────────────────────
function vibrationLevel(g: number): { label: string; color: string; desc: string } {
  if (g < 0.01)  return { label: 'NEGLIGIBLE',  color: C.green,  desc: 'Imperceptible. No structural concern.' };
  if (g < 0.05)  return { label: 'MINOR',       color: C.teal,   desc: 'Barely perceptible. Routine monitoring.' };
  if (g < 0.15)  return { label: 'MODERATE',    color: C.yellow, desc: 'Noticeable vibration. Inspect mounts and anchors.' };
  if (g < 0.30)  return { label: 'SIGNIFICANT', color: C.orange, desc: 'Strong vibration. Suspend sensitive operations.' };
  return         { label: 'SEVERE',      color: C.red,    desc: 'Dangerous vibration. Evacuate if persistent.' };
}

// ─── FEATURE 26: Tilt Angle Classification ────────────────────────────────────
function tiltLevel(deg: number): { label: string; color: string } {
  const abs = Math.abs(deg);
  if (abs < 0.5)  return { label: 'LEVEL',     color: C.green };
  if (abs < 2)    return { label: 'SLIGHT',    color: C.teal  };
  if (abs < 5)    return { label: 'MODERATE',  color: C.yellow };
  if (abs < 10)   return { label: 'SEVERE',    color: C.orange };
  return          { label: 'CRITICAL',  color: C.red   };
}

// ─── FEATURE 28: Structural Integrity Score ───────────────────────────────────
function calcIntegrityScore(vib: number, tiltX: number, tiltY: number): number {
  const vibScore  = Math.max(0, 100 - vib * 300);
  const tiltScore = Math.max(0, 100 - (Math.abs(tiltX) + Math.abs(tiltY)) * 8);
  return Math.round((vibScore * 0.6 + tiltScore * 0.4));
}

// ─── FEATURE 34: Building Response Category (ISO 10137) ───────────────────────
function buildingResponse(vib: number): { label: string; color: string } {
  if (vib < 0.005) return { label: 'ISO CLASS A — Imperceptible', color: C.green };
  if (vib < 0.02)  return { label: 'ISO CLASS B — Just Perceptible', color: C.teal };
  if (vib < 0.08)  return { label: 'ISO CLASS C — Clearly Perceptible', color: C.yellow };
  if (vib < 0.2)   return { label: 'ISO CLASS D — Strongly Perceptible', color: C.orange };
  return           { label: 'ISO CLASS E — Damaging', color: C.red };
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

const StructuralPage: React.FC<Props> = ({ simTick = 0 }) => {
  const [eventLog] = useState<{ time: string; vib: number; level: string }[]>([
    { time: '14:23:11', vib: 0.08, level: 'MODERATE' },
    { time: '14:18:44', vib: 0.04, level: 'MINOR' },
    { time: '13:55:02', vib: 0.12, level: 'MODERATE' },
    { time: '12:40:18', vib: 0.02, level: 'MINOR' },
    { time: '11:20:33', vib: 0.01, level: 'NEGLIGIBLE' },
  ]);

  const t   = simTick * 0.08;
  // Simulated MPU6050 + ADXL345 values
  const vibration = Math.max(0, 0.02 + Math.sin(t * 1.2) * 0.04 + (Math.random() - 0.5) * 0.01);
  const accelX    = Math.round((0.01 + Math.sin(t * 0.7) * 0.05 + (Math.random() - 0.5) * 0.005) * 1000) / 1000;
  const accelY    = Math.round((0.005 + Math.cos(t * 0.5) * 0.03 + (Math.random() - 0.5) * 0.005) * 1000) / 1000;
  const accelZ    = Math.round((9.81 + Math.sin(t * 0.2) * 0.02 + (Math.random() - 0.5) * 0.002) * 1000) / 1000;
  // ─── FEATURE 26: Tilt angle from accelerometer ────────────────────────────────
  const tiltX     = Math.round(Math.atan2(accelX, accelZ) * (180 / Math.PI) * 100) / 100;
  const tiltY     = Math.round(Math.atan2(accelY, accelZ) * (180 / Math.PI) * 100) / 100;

  const vibRound = Math.round(vibration * 1000) / 1000;
  const vibLvl   = vibrationLevel(vibRound);
  const tiltLvl  = tiltLevel(Math.max(Math.abs(tiltX), Math.abs(tiltY)));
  // ─── FEATURE 28: Integrity score ──────────────────────────────────────────────
  const integrity = calcIntegrityScore(vibRound, tiltX, tiltY);
  // ─── FEATURE 34: Building response ────────────────────────────────────────────
  const isoClass  = buildingResponse(vibRound);

  // ─── FEATURE 31: Vibration history chart ──────────────────────────────────────
  const vibHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    i,
    vib:   Math.round(Math.max(0, 0.02 + Math.sin(i * 0.8) * 0.04 + (Math.random() - 0.5) * 0.01) * 1000) / 1000,
    tiltX: Math.round((0.3 + Math.sin(i * 0.3) * 0.8 + (Math.random() - 0.5) * 0.1) * 100) / 100,
  })), []);

  // ─── FEATURE 36: Daily vibration baseline ─────────────────────────────────────
  const baselineVib = Math.round(vibHistory.reduce((a, b) => a + b.vib, 0) / vibHistory.length * 1000) / 1000;
  const vibDelta    = Math.round((vibRound - baselineVib) * 1000) / 1000;

  // ─── FEATURE 29: Seismic event detector ───────────────────────────────────────
  const eventDetected = vibRound > 0.15;

  return (
    <div className="page">
      <div className={`alert-strip ${vibRound < 0.05 ? 'as-safe' : vibRound < 0.15 ? 'as-warn' : 'as-danger'}`}>
        <span>⛫</span>
        <span>{vibLvl.label} — {vibLvl.desc}</span>
      </div>

      {/* ─── FEATURE 29: Seismic event alert ── */}
      {eventDetected && (
        <div style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.4)', borderRadius: 8, padding: '10px 14px', margin: '10px 0', fontFamily: 'var(--mono)', fontSize: 9, color: C.red, letterSpacing: 1, display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span>SEISMIC EVENT DETECTED — Vibration {vibRound}g exceeds threshold 0.15g. Log event and inspect structure.</span>
        </div>
      )}

      {/* ── Row 1: 4 key metrics ── */}
      <div className="g4 mt">
        {/* Vibration */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⛫ Vibration</div>
            <span className="badge" style={{ color: vibLvl.color, background: `${vibLvl.color}15`, border: `1px solid ${vibLvl.color}30` }}>{vibLvl.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: vibLvl.color }}>{vibRound}</span>
            <span className="bn-unit">g</span>
            <div className="bn-label">MPU6050 · Peak acceleration</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: vibLvl.color }} />
              <span className="status-txt" style={{ color: vibLvl.color }}>{isoClass.label}</span>
            </div>
          </div>
        </div>

        {/* Tilt X/Y */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⛫ Tilt Angle</div>
            <span className="badge" style={{ color: tiltLvl.color, background: `${tiltLvl.color}15`, border: `1px solid ${tiltLvl.color}30` }}>{tiltLvl.label}</span>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { axis: 'TILT X', val: tiltX, unit: '°' },
              { axis: 'TILT Y', val: tiltY, unit: '°' },
            ].map((a, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 1 }}>{a.axis}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: tiltLvl.color, fontWeight: 700 }}>{a.val}{a.unit}</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (Math.abs(a.val) / 10) * 100)}%`, background: tiltLvl.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FEATURE 27: Acceleration vector ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⛫ Accel Vector</div>
            <span className="badge badge-info">ADXL345</span>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { axis: 'X-AXIS', val: accelX, color: C.red    },
              { axis: 'Y-AXIS', val: accelY, color: C.green  },
              { axis: 'Z-AXIS', val: accelZ, color: C.blue   },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)' }}>{a.axis}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: a.color, fontWeight: 700 }}>{a.val} g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Integrity Score */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⛫ Integrity Score</div>
            <span className="badge" style={{ color: integrity > 66 ? C.green : integrity > 33 ? C.yellow : C.red, background: (integrity > 66 ? C.green : integrity > 33 ? C.yellow : C.red) + '15' }}>
              {integrity > 66 ? 'GOOD' : integrity > 33 ? 'FAIR' : 'POOR'}
            </span>
          </div>
          <div className="composite" style={{ padding: '16px 14px' }}>
            <div className="comp-num" style={{ fontSize: 48, color: integrity > 66 ? C.green : integrity > 33 ? C.yellow : C.red }}>{integrity}</div>
            <div className="comp-label">out of 100</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginTop: 6 }}>
              Baseline Δ: <span style={{ color: vibDelta > 0 ? C.red : C.green }}>{vibDelta > 0 ? '+' : ''}{vibDelta}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Vibration trend chart ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">⛫ Vibration Trend — Last 30 Readings</div>
          <span className="badge badge-info">Baseline {baselineVib}g</span>
        </div>
        <div className="chart-box tall">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={vibHistory} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="g-vib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={vibLvl.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={vibLvl.color} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis domain={[0, 0.3]} hide />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={0.05}  stroke={C.yellow} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'MINOR 0.05g',    position: 'right', fontSize: 8, fill: C.yellow, fontFamily: 'monospace' }} />
              <ReferenceLine y={0.15}  stroke={C.red}    strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'SIGNIFICANT 0.15g', position: 'right', fontSize: 8, fill: C.red, fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="vib" name="Vibration (g)" stroke={vibLvl.color} fill="url(#g-vib)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Event log + Recommendations ── */}
      <div className="g2 mt">
        {/* ─── FEATURE 30: Seismic event log ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⛫ Event Log</div>
            <span className="badge badge-info">{eventLog.length} EVENTS</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {eventLog.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderBottom: i < eventLog.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', width: 60, flexShrink: 0 }}>{ev.time}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: vibrationLevel(ev.vib).color, flex: 1 }}>{ev.level}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: vibrationLevel(ev.vib).color, fontWeight: 700 }}>{ev.vib}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FEATURE 35: Inspection thresholds ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Inspection Thresholds</div>
          </div>
          <div className="rec-list">
            <div className="rec-item">
              <div className="rec-icon" style={{ color: C.yellow }}>⚠</div>
              <div className="rec-text"><strong>Vibration ≥ 0.05g:</strong> Visual inspection of mounts, anchors, and joints within 24h.</div>
            </div>
            <div className="rec-item">
              <div className="rec-icon" style={{ color: C.orange }}>⚠</div>
              <div className="rec-text"><strong>Vibration ≥ 0.15g:</strong> Structural engineer inspection required. Suspend operations if continuous.</div>
            </div>
            <div className="rec-item">
              <div className="rec-icon" style={{ color: C.red }}>🚨</div>
              <div className="rec-text"><strong>Tilt ≥ 5°:</strong> Immediate evacuation assessment. Check foundation and load-bearing elements.</div>
            </div>
            <div className="rec-item">
              <div className="rec-icon" style={{ color: C.green }}>✓</div>
              <div className="rec-text"><strong>Current status:</strong> {vibLvl.label} vibration detected. {isoClass.label}.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructuralPage;
