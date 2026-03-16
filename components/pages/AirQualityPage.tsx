
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props { simTick?: number; }

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', orange: '#ff6820', teal: '#14b8a6', purple: '#a855f7', dim: '#182430', s2: '#0d1419' };

// ─── FEATURE 13: AQI Scale (EPA Standard) ─────────────────────────────────────
const AQI_SCALE = [
  { range: '0 – 50',    label: 'Good',             color: C.green,  advice: 'Air quality is satisfactory. No health risk.' },
  { range: '51 – 100',  label: 'Moderate',          color: C.yellow, advice: 'Acceptable. Unusually sensitive people should limit outdoor exertion.' },
  { range: '101 – 150', label: 'Unhealthy for USG', color: C.orange, advice: 'Members of sensitive groups may experience effects.' },
  { range: '151 – 200', label: 'Unhealthy',         color: C.red,    advice: 'Everyone may begin to experience health effects.' },
  { range: '201 – 300', label: 'Very Unhealthy',    color: '#c026d3',advice: 'Health alert — serious effects for everyone.' },
  { range: '301 – 500', label: 'Hazardous',         color: '#7e0023',advice: 'Health warning of emergency conditions.' },
];

// ─── FEATURE 14: AQI Color & Category ─────────────────────────────────────────
function aqiCategory(aqi: number) {
  if (aqi <= 50)  return AQI_SCALE[0];
  if (aqi <= 100) return AQI_SCALE[1];
  if (aqi <= 150) return AQI_SCALE[2];
  if (aqi <= 200) return AQI_SCALE[3];
  if (aqi <= 300) return AQI_SCALE[4];
  return AQI_SCALE[5];
}

// ─── FEATURE 15: CO2 Safety Level ─────────────────────────────────────────────
function co2Level(ppm: number): { label: string; color: string } {
  if (ppm < 800)  return { label: 'EXCELLENT', color: C.green };
  if (ppm < 1000) return { label: 'GOOD',      color: C.teal };
  if (ppm < 1500) return { label: 'MODERATE',  color: C.yellow };
  if (ppm < 2000) return { label: 'POOR',      color: C.orange };
  return { label: 'HAZARDOUS', color: C.red };
}

// ─── FEATURE 16: PM2.5 WHO Guideline ──────────────────────────────────────────
function pm25Level(pm: number): { label: string; color: string } {
  if (pm < 12)  return { label: 'GOOD',       color: C.green };
  if (pm < 35)  return { label: 'MODERATE',   color: C.yellow };
  if (pm < 55)  return { label: 'UNHEALTHY',  color: C.orange };
  return        { label: 'HAZARDOUS',  color: C.red };
}

// ─── FEATURE 24: Sensor warm-up status ────────────────────────────────────────
function warmupStatus(tick: number): { pct: number; ready: boolean } {
  const pct = Math.min(100, Math.round((tick / 50) * 100));
  return { pct, ready: tick >= 50 };
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

const AirQualityPage: React.FC<Props> = ({ simTick = 60 }) => {
  const t    = simTick * 0.1;
  const warm = warmupStatus(simTick);

  // Simulated MQ-135 values
  const aqi     = Math.round(Math.max(0, 55 + Math.sin(t * 0.5) * 35 + (Math.random() - 0.5) * 8));
  const co2     = Math.round(650 + Math.sin(t * 0.3) * 200 + (Math.random() - 0.5) * 20);
  const pm25    = Math.round((18 + Math.sin(t * 0.4) * 10 + (Math.random() - 0.5) * 2) * 10) / 10;
  const pm10    = Math.round((pm25 * 1.6 + (Math.random() - 0.5) * 5) * 10) / 10;
  // ─── FEATURE 17: NH3 detection ────────────────────────────────────────────────
  const nh3     = Math.round((12 + Math.sin(t * 0.25) * 8 + (Math.random() - 0.5) * 2) * 10) / 10;
  // ─── FEATURE 18: Benzene concentration ────────────────────────────────────────
  const benzene = Math.round((0.8 + Math.sin(t * 0.2) * 0.5 + (Math.random() - 0.5) * 0.1) * 100) / 100;

  const cat    = aqiCategory(aqi);
  const co2Cat = co2Level(co2);
  const pmCat  = pm25Level(pm25);

  // ─── FEATURE 20: AQI trend chart history ──────────────────────────────────────
  const aqiHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    i,
    aqi:  Math.round(Math.max(0, 55 + Math.sin(i * 0.4) * 30 + (Math.random() - 0.5) * 10)),
    co2:  Math.round(650 + Math.sin(i * 0.3) * 150 + (Math.random() - 0.5) * 30),
    pm25: Math.round((18 + Math.sin(i * 0.35) * 8) * 10) / 10,
  })), []);

  const avgAqi  = Math.round(aqiHistory.reduce((a, b) => a + b.aqi, 0) / aqiHistory.length);
  const maxAqi  = Math.max(...aqiHistory.map(d => d.aqi));

  // ─── FEATURE 23: Outdoor vs indoor advisory ───────────────────────────────────
  const outdoorAqi = Math.round(aqi * 1.3);
  const outdoorCat = aqiCategory(outdoorAqi);

  return (
    <div className="page">
      {/* ─── FEATURE 19: Health advisory banner ── */}
      <div className={`alert-strip ${aqi < 51 ? 'as-safe' : aqi < 101 ? 'as-warn' : 'as-danger'}`}>
        <span>⚑</span>
        <span>AQI {aqi} — {cat.label}: {cat.advice}</span>
      </div>

      {/* ─── FEATURE 24: Sensor warm-up timer ── */}
      {!warm.ready && (
        <div style={{ background: 'rgba(255,201,64,0.08)', border: '1px solid rgba(255,201,64,0.25)', borderRadius: 8, padding: '10px 14px', margin: '10px 0', fontFamily: 'var(--mono)', fontSize: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: C.yellow, letterSpacing: 1 }}>MQ-135 WARM-UP IN PROGRESS</span>
            <span style={{ color: C.yellow }}>{warm.pct}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${warm.pct}%`, background: C.yellow, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ color: 'var(--dim)', marginTop: 5 }}>MQ-135 requires 24h warm-up for accurate readings. Values shown are estimates.</div>
        </div>
      )}

      {/* ── Row 1: 4 key air metrics ── */}
      <div className="g4 mt">
        {/* AQI */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚑ AQI</div>
            <span className="badge" style={{ color: cat.color, background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>{cat.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: cat.color }}>{aqi}</span>
            <span className="bn-unit">AQI</span>
            <div className="bn-label">EPA Air Quality Index</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: cat.color }} />
              <span className="status-txt" style={{ color: cat.color }}>{cat.label}</span>
            </div>
          </div>
        </div>

        {/* CO2 */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚑ CO₂</div>
            <span className="badge" style={{ color: co2Cat.color, background: `${co2Cat.color}15`, border: `1px solid ${co2Cat.color}30` }}>{co2Cat.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: co2Cat.color }}>{co2}</span>
            <span className="bn-unit">ppm</span>
            <div className="bn-label">Carbon dioxide · MQ-135 estimate</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: co2Cat.color }} />
              <span className="status-txt" style={{ color: co2Cat.color }}>Safe &lt; 1000 ppm</span>
            </div>
          </div>
        </div>

        {/* PM2.5 */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚑ PM2.5</div>
            <span className="badge" style={{ color: pmCat.color, background: `${pmCat.color}15`, border: `1px solid ${pmCat.color}30` }}>{pmCat.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: pmCat.color }}>{pm25}</span>
            <span className="bn-unit">µg/m³</span>
            <div className="bn-label">Fine particles · WHO limit 15 µg/m³</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: pmCat.color }} />
              <span className="status-txt" style={{ color: pmCat.color }}>PM10: {pm10} µg/m³</span>
            </div>
          </div>
        </div>

        {/* Gas sensors */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚑ Gas Trace</div>
            <span className="badge badge-info">MQ-135</span>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {[
              { label: 'NH₃ (Ammonia)',  value: nh3,     unit: 'ppm',  safe: 25,   color: C.teal   },
              { label: 'Benzene',        value: benzene, unit: 'ppm',  safe: 1,    color: C.purple },
              { label: 'PM10',           value: pm10,    unit: 'µg/m³',safe: 45,   color: C.blue   },
            ].map((g, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 1 }}>{g.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: g.value > g.safe ? C.red : g.color, fontWeight: 700 }}>{g.value} {g.unit}</span>
                </div>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (g.value / (g.safe * 2)) * 100)}%`, background: g.value > g.safe ? C.red : g.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: AQI trend + scale ── */}
      <div className="g21 mt">
        {/* AQI Trend chart */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚑ AQI Trend — Last 30 Readings</div>
            <span className="badge badge-info">Avg {avgAqi} · Max {maxAqi}</span>
          </div>
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={aqiHistory} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-aqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={cat.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={cat.color} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, 300]} hide />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={51}  stroke={C.yellow} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'MOD 51', position: 'right', fontSize: 8, fill: C.yellow, fontFamily: 'monospace' }} />
                <ReferenceLine y={101} stroke={C.orange} strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'USG 101', position: 'right', fontSize: 8, fill: C.orange, fontFamily: 'monospace' }} />
                <ReferenceLine y={151} stroke={C.red}    strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'UNH 151', position: 'right', fontSize: 8, fill: C.red, fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="aqi" name="AQI" stroke={cat.color} fill="url(#g-aqi)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── FEATURE 21: AQI Category breakdown ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">AQI Scale (EPA)</div>
          </div>
          <div className="hscale">
            {AQI_SCALE.map((row, i) => (
              <div key={i} className="hs-row" style={{ background: cat.label === row.label ? `${row.color}12` : '' }}>
                <div className="hs-dot" style={{ background: row.color }} />
                <div className="hs-range" style={{ fontSize: 8 }}>{row.range}</div>
                <div className="hs-label" style={{ color: cat.label === row.label ? row.color : 'var(--mid)', fontSize: 8 }}>{row.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Indoor vs Outdoor + Recommendations ── */}
      <div className="g2 mt">
        {/* ─── FEATURE 23: Indoor vs Outdoor comparison ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Indoor vs Outdoor AQI</div>
            <span className="badge badge-info">ESTIMATE</span>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { label: 'INDOOR (this sensor)', value: aqi,        cat: cat },
              { label: 'OUTDOOR (est. ×1.3)', value: outdoorAqi, cat: outdoorCat },
            ].map((loc, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 1 }}>{loc.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: loc.cat.color, fontWeight: 700 }}>{loc.value} · {loc.cat.label}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (loc.value / 300) * 100)}%`, background: loc.cat.color, borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
            ))}
            <div className="insight" style={{ borderColor: cat.color, marginTop: 8 }}>
              <div className="insight-title" style={{ color: cat.color }}>Ventilation Advisory</div>
              <div className="insight-body">
                {aqi < 51
                  ? 'Open windows recommended. Fresh air will improve indoor comfort and reduce CO₂.'
                  : aqi < 101
                  ? 'Moderate AQI. Keep windows closed if sensitive individuals are present. Run HEPA filters.'
                  : 'Poor outdoor air quality. Keep building sealed. Run air purifiers at maximum capacity.'}
              </div>
            </div>
          </div>
        </div>

        {/* ─── FEATURE 22: Ventilation recommendations ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Action Recommendations</div>
          </div>
          <div className="rec-list">
            {aqi < 51 && (
              <>
                <div className="rec-item"><div className="rec-icon">✓</div><div className="rec-text"><strong>Air quality is good.</strong> No protective action needed. Continue normal operations and routine monitoring.</div></div>
                <div className="rec-item"><div className="rec-icon">⚑</div><div className="rec-text"><strong>Calibrate MQ-135 monthly.</strong> Use known reference gas or fresh air baseline. Sensor drift is common after 6 months.</div></div>
              </>
            )}
            {aqi >= 51 && aqi < 101 && (
              <>
                <div className="rec-item"><div className="rec-icon">⚠</div><div className="rec-text"><strong>Moderate AQI detected.</strong> Unusually sensitive individuals should limit extended outdoor activities.</div></div>
                <div className="rec-item"><div className="rec-icon">🌬</div><div className="rec-text"><strong>Increase ventilation.</strong> Open windows on windward side. Check HVAC filters for replacement.</div></div>
              </>
            )}
            {aqi >= 101 && (
              <>
                <div className="rec-item"><div className="rec-icon">🚨</div><div className="rec-text"><strong>Unhealthy AQI level.</strong> Sensitive groups (children, elderly, asthma patients) should stay indoors. Issue health advisory.</div></div>
                <div className="rec-item"><div className="rec-icon">🔍</div><div className="rec-text"><strong>Identify pollution source.</strong> Check for nearby vehicles, construction, chemical storage, or HVAC exhaust recirculation.</div></div>
                <div className="rec-item"><div className="rec-icon">💨</div><div className="rec-text"><strong>Deploy air purifiers.</strong> HEPA + activated carbon filters recommended. Target PM2.5 below 35 µg/m³ as immediate priority.</div></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityPage;
