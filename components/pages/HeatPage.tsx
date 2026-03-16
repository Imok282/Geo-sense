
import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Props {
  simTick?: number; // demo mode tick for animated values
}

// ─── FEATURE 1: Heat Index Calculator ─────────────────────────────────────────
function calcHeatIndex(T: number, RH: number): number {
  // Rothfusz regression equation (NOAA)
  if (T < 27) return T;
  const HI =
    -8.78469475556 +
    1.61139411 * T +
    2.33854883889 * RH +
    -0.14611605 * T * RH +
    -0.012308094 * T * T +
    -0.0164248277778 * RH * RH +
    0.002211732 * T * T * RH +
    0.00072546 * T * RH * RH +
    -0.000003582 * T * T * RH * RH;
  return Math.round(HI * 10) / 10;
}

// ─── FEATURE 2: Dew Point Calculator ──────────────────────────────────────────
function calcDewPoint(T: number, RH: number): number {
  const a = 17.27, b = 237.7;
  const alpha = (a * T) / (b + T) + Math.log(RH / 100);
  return Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
}

// ─── FEATURE 3: Thermal Comfort Zone ──────────────────────────────────────────
function thermalZone(hi: number): { label: string; color: string; advice: string } {
  if (hi < 27)  return { label: 'COMFORTABLE',       color: '#00e0a0', advice: 'No heat-related risk. Normal outdoor activities are safe.' };
  if (hi < 33)  return { label: 'CAUTION',            color: '#2dc8f0', advice: 'Fatigue possible with prolonged exposure. Stay hydrated.' };
  if (hi < 39)  return { label: 'EXTREME CAUTION',   color: '#ffc940', advice: 'Heat cramps & heat exhaustion possible. Limit outdoor exertion.' };
  if (hi < 46)  return { label: 'DANGER',             color: '#ff6820', advice: 'Heat cramps and exhaustion likely. Heat stroke possible.' };
  return        { label: 'EXTREME DANGER',  color: '#ff2d55', advice: 'Heat stroke highly likely. Avoid outdoor activity.' };
}

// ─── FEATURE 4: Cooling Degree Days ───────────────────────────────────────────
function coolingDegreeDays(T: number): number {
  return Math.max(0, Math.round((T - 18) * 10) / 10);
}

// ─── FEATURE 5: Thermal Category Badge ────────────────────────────────────────
function humidityCategory(rh: number): { label: string; color: string } {
  if (rh < 30)  return { label: 'DRY',         color: '#ff6820' };
  if (rh < 60)  return { label: 'COMFORTABLE', color: '#00e0a0' };
  if (rh < 80)  return { label: 'HUMID',       color: '#ffc940' };
  return        { label: 'VERY HUMID',  color: '#ff2d55' };
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', orange: '#ff6820', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

// ─── FEATURE 6: Gauge Bar Component ───────────────────────────────────────────
const GaugeBar = ({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color, fontWeight: 700 }}>{value}{unit}</span>
    </div>
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

// ─── HEAT PAGE ────────────────────────────────────────────────────────────────
const HeatPage: React.FC<Props> = ({ simTick = 0 }) => {
  // Simulated sensor values (DHT22) — oscillate realistically
  const t = simTick * 0.12;
  const temperature = Math.round((28 + Math.sin(t * 0.4) * 6 + (Math.random() - 0.5) * 0.5) * 10) / 10;
  const humidity    = Math.round((62 + Math.sin(t * 0.2) * 18 + (Math.random() - 0.5) * 1) * 10) / 10;

  // ─── FEATURE 1: Heat Index ──────────────────────────────────────────────────
  const heatIndex  = calcHeatIndex(temperature, humidity);
  // ─── FEATURE 2: Dew Point ───────────────────────────────────────────────────
  const dewPoint   = calcDewPoint(temperature, humidity);
  // ─── FEATURE 3: Thermal Zone ────────────────────────────────────────────────
  const zone       = thermalZone(heatIndex);
  // ─── FEATURE 4: CDD ─────────────────────────────────────────────────────────
  const cdd        = coolingDegreeDays(temperature);
  // ─── FEATURE 5: Humidity Cat ────────────────────────────────────────────────
  const humCat     = humidityCategory(humidity);

  // ─── FEATURE 7: Generate sparkline history ──────────────────────────────────
  const tempHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    i,
    temp: Math.round((28 + Math.sin(i * 0.3) * 5 + (Math.random() - 0.5) * 1) * 10) / 10,
    hi:   Math.round((32 + Math.sin(i * 0.3) * 6 + (Math.random() - 0.5) * 1) * 10) / 10,
  })), []);

  // ─── FEATURE 8: Statistics ──────────────────────────────────────────────────
  const temps   = tempHistory.map(d => d.temp);
  const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length * 10) / 10;
  const minTemp = Math.round(Math.min(...temps) * 10) / 10;
  const maxTemp = Math.round(Math.max(...temps) * 10) / 10;

  // ─── FEATURE 9: Apparent Temperature ────────────────────────────────────────
  const apparentTemp = Math.round((heatIndex - temperature + temperature) * 10) / 10;

  // ─── FEATURE 10: Trend detection ────────────────────────────────────────────
  const tempTrend = temps.length >= 3
    ? temps[temps.length - 1] > temps[temps.length - 3] ? '↑ Rising' : '↓ Falling'
    : '→ Stable';

  // ─── FEATURE 11: WHO heat thresholds display ─────────────────────────────────
  const whoThresholds = [
    { label: 'Comfortable',    hi: 27, color: C.green },
    { label: 'Caution',        hi: 33, color: C.blue },
    { label: 'Extreme Caution',hi: 39, color: C.yellow },
    { label: 'Danger',         hi: 46, color: C.orange },
    { label: 'Extreme Danger', hi: 54, color: C.red },
  ];

  return (
    <div className="page">
      {/* ─── FEATURE 12: Alert strip based on thermal zone ── */}
      <div className={`alert-strip ${heatIndex < 33 ? 'as-safe' : heatIndex < 39 ? 'as-warn' : 'as-danger'}`}>
        <span>∿</span>
        <span>{zone.label} — {zone.advice}</span>
      </div>

      {/* ── Row 1: Key metrics ── */}
      <div className="g4 mt">
        {/* Temperature */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">∿ Temperature</div>
            <span className="badge" style={{ color: zone.color, background: `${zone.color}15`, border: `1px solid ${zone.color}30` }}>
              {tempTrend}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: zone.color }}>{temperature}</span>
            <span className="bn-unit">°C</span>
            <div className="bn-label">DHT22 · Ambient temperature</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: zone.color }} />
              <span className="status-txt" style={{ color: zone.color }}>GPIO 4</span>
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">∿ Humidity</div>
            <span className="badge" style={{ color: humCat.color, background: `${humCat.color}15`, border: `1px solid ${humCat.color}30` }}>
              {humCat.label}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: humCat.color }}>{humidity}</span>
            <span className="bn-unit">%</span>
            <div className="bn-label">DHT22 · Relative humidity</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: humCat.color }} />
              <span className="status-txt" style={{ color: humCat.color }}>{humCat.label}</span>
            </div>
          </div>
        </div>

        {/* Heat Index */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">∿ Heat Index</div>
            <span className="badge" style={{ color: zone.color, background: `${zone.color}15`, border: `1px solid ${zone.color}30` }}>
              {zone.label}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: zone.color }}>{heatIndex}</span>
            <span className="bn-unit">°C</span>
            <div className="bn-label">NOAA Rothfusz formula</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: zone.color }} />
              <span className="status-txt" style={{ color: zone.color }}>Apparent: {apparentTemp}°C</span>
            </div>
          </div>
        </div>

        {/* Dew Point */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">∿ Dew Point</div>
            <span className="badge badge-info">CALC</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: C.teal }}>{dewPoint}</span>
            <span className="bn-unit">°C</span>
            <div className="bn-label">Magnus formula estimate</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: C.teal }} />
              <span className="status-txt" style={{ color: C.teal }}>CDD: {cdd} degree-days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Temperature trend chart + Zone scale ── */}
      <div className="g21 mt">
        {/* Temperature + Heat Index trend chart */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">∿ Temperature & Heat Index — 30 Readings</div>
            <span className="badge badge-info">{avgTemp}°C avg</span>
          </div>
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={tempHistory} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-temp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={zone.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={zone.color} stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="g-hi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.red} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.red} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={[15, 55]} hide />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={39} stroke={C.yellow} strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'DANGER 39°C', position: 'right', fontSize: 8, fill: C.yellow, fontFamily: 'monospace' }} />
                <ReferenceLine y={46} stroke={C.red} strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'EXTREME 46°C', position: 'right', fontSize: 8, fill: C.red, fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="temp" name="Temp (°C)"       stroke={zone.color} fill="url(#g-temp)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="hi"   name="Heat Index (°C)" stroke={C.red}      fill="url(#g-hi)"  strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 2, background: zone.color, borderRadius: 1 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>AMBIENT TEMP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 2, background: C.red, borderRadius: 1 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>HEAT INDEX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermal Zone Scale */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Heat Index Scale</div>
          </div>
          <div className="hscale" style={{ padding: '8px 0' }}>
            {whoThresholds.map((t, i) => (
              <div key={i} className="hs-row" style={{ background: heatIndex >= t.hi && (whoThresholds[i + 1] ? heatIndex < whoThresholds[i + 1].hi : true) ? `${t.color}10` : '' }}>
                <div className="hs-dot" style={{ background: t.color }} />
                <div className="hs-range">≥ {t.hi}°C</div>
                <div className="hs-label" style={{ color: t.color }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Gauges + Stats ── */}
      <div className="g2 mt">
        {/* Sensor gauges */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">∿ Sensor Gauges</div>
            <span className="badge badge-safe">DHT22 ONLINE</span>
          </div>
          <div style={{ padding: '14px' }}>
            <GaugeBar value={temperature} max={50}  color={zone.color} label="TEMPERATURE" unit="°C" />
            <GaugeBar value={humidity}    max={100} color={humCat.color} label="HUMIDITY" unit="%" />
            <GaugeBar value={heatIndex}   max={55}  color={zone.color} label="HEAT INDEX" unit="°C" />
            <GaugeBar value={dewPoint}    max={30}  color={C.teal} label="DEW POINT" unit="°C" />
            <GaugeBar value={cdd}         max={20}  color={C.yellow} label="COOLING DEGREE DAYS" unit="" />
          </div>
        </div>

        {/* Session statistics */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Session Statistics</div>
            <span className="badge badge-info">30 PTS</span>
          </div>
          <div className="stat-grid">
            <div className="stat-cell">
              <div className="sc-label">Avg Temp</div>
              <div className="sc-val" style={{ color: zone.color }}>{avgTemp} °C</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Min Temp</div>
              <div className="sc-val c-green">{minTemp} °C</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Max Temp</div>
              <div className="sc-val" style={{ color: C.red }}>{maxTemp} °C</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Heat Index</div>
              <div className="sc-val" style={{ color: zone.color }}>{heatIndex} °C</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Humidity</div>
              <div className="sc-val" style={{ color: humCat.color }}>{humidity} %</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Dew Point</div>
              <div className="sc-val" style={{ color: C.teal }}>{dewPoint} °C</div>
            </div>
          </div>

          {/* Comfort zone insight */}
          <div className="insight" style={{ borderColor: zone.color, margin: '0 14px 14px' }}>
            <div className="insight-title" style={{ color: zone.color }}>{zone.label}</div>
            <div className="insight-body">{zone.advice}</div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Recommendations ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">Heat Safety Recommendations</div>
        </div>
        <div className="rec-list">
          {heatIndex < 33 && (
            <>
              <div className="rec-item"><div className="rec-icon">✓</div><div className="rec-text"><strong>Comfortable conditions.</strong> Normal activities are safe. Maintain routine monitoring at 15-minute intervals.</div></div>
              <div className="rec-item"><div className="rec-icon">∿</div><div className="rec-text"><strong>Ventilation adequate.</strong> Current temperature and humidity suggest normal HVAC load. Check filter status monthly.</div></div>
              <div className="rec-item"><div className="rec-icon">📋</div><div className="rec-text"><strong>Document baseline.</strong> Log this as reference for seasonal comparison. Heat index variation over ±5°C warrants investigation.</div></div>
            </>
          )}
          {heatIndex >= 33 && heatIndex < 39 && (
            <>
              <div className="rec-item"><div className="rec-icon">⚠</div><div className="rec-text"><strong>Caution advised.</strong> Fatigue possible with prolonged exposure and physical activity. Schedule breaks every 30 minutes.</div></div>
              <div className="rec-item"><div className="rec-icon">💧</div><div className="rec-text"><strong>Increase hydration.</strong> Provide access to cool water. Recommend 500ml per hour for anyone working in the area.</div></div>
            </>
          )}
          {heatIndex >= 39 && (
            <>
              <div className="rec-item"><div className="rec-icon">🚨</div><div className="rec-text"><strong>Dangerous heat conditions.</strong> Restrict outdoor activities. Activate cooling protocols — open shade areas, cold water stations, misting systems.</div></div>
              <div className="rec-item"><div className="rec-icon">🏥</div><div className="rec-text"><strong>Monitor for heat illness.</strong> Watch for dizziness, nausea, rapid pulse. Have emergency contact ready. Move affected persons to air-conditioned space immediately.</div></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatPage;
