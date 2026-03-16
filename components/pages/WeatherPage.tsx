
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props { simTick?: number; }

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', orange: '#ff6820', teal: '#14b8a6', purple: '#a855f7', dim: '#182430', s2: '#0d1419' };

// ─── FEATURE 38: Rain Status ───────────────────────────────────────────────────
function rainStatus(intensity: number): { label: string; color: string; floodRisk: string } {
  if (intensity < 0.1)  return { label: 'NONE',     color: C.green,  floodRisk: 'LOW' };
  if (intensity < 2.5)  return { label: 'LIGHT',    color: C.teal,   floodRisk: 'LOW' };
  if (intensity < 7.6)  return { label: 'MODERATE', color: C.blue,   floodRisk: 'MODERATE' };
  if (intensity < 50)   return { label: 'HEAVY',    color: C.yellow, floodRisk: 'HIGH' };
  return                { label: 'EXTREME', color: C.red,    floodRisk: 'CRITICAL' };
}

// ─── FEATURE 41: Weather Trend ────────────────────────────────────────────────
function weatherTrend(pressure: number, prevPressure: number): { label: string; color: string; icon: string } {
  const delta = pressure - prevPressure;
  if (delta > 1)    return { label: 'IMPROVING',     color: C.green,  icon: '↑' };
  if (delta > 0)    return { label: 'STABLE',        color: C.teal,   icon: '→' };
  if (delta > -1)   return { label: 'STABLE',        color: C.blue,   icon: '→' };
  if (delta > -3)   return { label: 'DETERIORATING', color: C.yellow, icon: '↓' };
  return            { label: 'STORMY',        color: C.red,    icon: '↓↓' };
}

// ─── FEATURE 40: Ambient Light Interpretation ─────────────────────────────────
function lightLevel(lux: number): { label: string; color: string } {
  if (lux < 10)    return { label: 'DARK / NIGHT',  color: C.purple };
  if (lux < 200)   return { label: 'INDOOR / CLOUDY', color: C.blue };
  if (lux < 1000)  return { label: 'OVERCAST',      color: C.teal };
  if (lux < 10000) return { label: 'DAYLIGHT',      color: C.yellow };
  return           { label: 'DIRECT SUN',   color: C.orange };
}

// ─── FEATURE 41: UV Index ─────────────────────────────────────────────────────
function uvLevel(idx: number): { label: string; color: string } {
  if (idx < 3)  return { label: 'LOW',       color: C.green  };
  if (idx < 6)  return { label: 'MODERATE',  color: C.yellow };
  if (idx < 8)  return { label: 'HIGH',      color: C.orange };
  if (idx < 11) return { label: 'VERY HIGH', color: C.red    };
  return        { label: 'EXTREME',  color: '#c026d3' };
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

const WeatherPage: React.FC<Props> = ({ simTick = 0 }) => {
  const t = simTick * 0.1;

  // Simulated FC-37 + BH1750 + BMP280 values
  const rainfall    = Math.max(0, Math.round((1.5 + Math.sin(t * 0.4) * 3 + (Math.random() - 0.5) * 0.5) * 10) / 10);
  const pressure    = Math.round((1013 + Math.sin(t * 0.15) * 8 + (Math.random() - 0.5) * 1) * 10) / 10;
  const prevPressure = pressure - (Math.sin((t - 1) * 0.15) * 0.5);
  const lux         = Math.round(Math.max(0, 3200 + Math.sin(t * 0.2) * 2800 + (Math.random() - 0.5) * 100));
  const uvIndex     = Math.round((3.5 + Math.sin(t * 0.18) * 2.5 + (Math.random() - 0.5) * 0.3) * 10) / 10;
  // ─── FEATURE 44: Wind speed estimate from pressure gradient ───────────────────
  const windSpeed   = Math.round(Math.max(0, 12 + Math.sin(t * 0.3) * 8 + (Math.random() - 0.5) * 2) * 10) / 10;
  // ─── FEATURE 46: Rainfall accumulation tracker ────────────────────────────────
  const accumulation = Math.round(rainfall * 0.5 * 100) / 100;

  const rain    = rainStatus(rainfall);
  const trend   = weatherTrend(pressure, prevPressure);
  const light   = lightLevel(lux);
  const uv      = uvLevel(uvIndex);

  // ─── FEATURE 45: 7-day weather summary ────────────────────────────────────────
  const weekSummary = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      rain: Math.round(Math.max(0, 1.5 + Math.sin(i * 0.8) * 3) * 10) / 10,
      temp: Math.round(26 + Math.sin(i * 0.5) * 4),
    }));
  }, []);

  // ─── FEATURE 38: Rainfall history chart ───────────────────────────────────────
  const rainHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    i,
    rain: Math.round(Math.max(0, 1.5 + Math.sin(i * 0.4) * 2.5 + (Math.random() - 0.5) * 0.5) * 10) / 10,
    pressure: Math.round(1013 + Math.sin(i * 0.15) * 6),
  })), []);

  // ─── FEATURE 43: Visibility estimate from lux ─────────────────────────────────
  const visibility = lux > 5000 ? 'CLEAR (10+ km)' : lux > 1000 ? 'GOOD (5-10 km)' : lux > 200 ? 'MODERATE (2-5 km)' : 'POOR (<2 km)';

  return (
    <div className="page">
      <div className={`alert-strip ${rain.label === 'NONE' || rain.label === 'LIGHT' ? 'as-safe' : rain.label === 'MODERATE' ? 'as-warn' : 'as-danger'}`}>
        <span>☄</span>
        <span>Rainfall: {rain.label} ({rainfall} mm/hr) · Flood risk: {rain.floodRisk} · Trend: {trend.icon} {trend.label}</span>
      </div>

      {/* ── Row 1: 4 key weather metrics ── */}
      <div className="g4 mt">
        {/* Rainfall */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">☄ Rainfall</div>
            <span className="badge" style={{ color: rain.color, background: `${rain.color}15`, border: `1px solid ${rain.color}30` }}>{rain.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: rain.color }}>{rainfall}</span>
            <span className="bn-unit">mm/hr</span>
            <div className="bn-label">FC-37 Rain Sensor · Intensity</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: rain.color }} />
              <span className="status-txt" style={{ color: rain.color }}>Accum: {accumulation} mm</span>
            </div>
          </div>
        </div>

        {/* Pressure */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">☄ Pressure</div>
            <span className="badge" style={{ color: trend.color, background: `${trend.color}15`, border: `1px solid ${trend.color}30` }}>{trend.icon} {trend.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: trend.color }}>{pressure}</span>
            <span className="bn-unit">hPa</span>
            <div className="bn-label">BMP280 · Barometric pressure</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: trend.color }} />
              <span className="status-txt" style={{ color: trend.color }}>Standard: 1013.25 hPa</span>
            </div>
          </div>
        </div>

        {/* Ambient Light */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">☄ Light / UV</div>
            <span className="badge" style={{ color: light.color, background: `${light.color}15`, border: `1px solid ${light.color}30` }}>{light.label}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: light.color }}>{lux.toLocaleString()}</span>
            <span className="bn-unit">lux</span>
            <div className="bn-label">BH1750 · Ambient luminosity</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: uv.color }} />
              <span className="status-txt" style={{ color: uv.color }}>UV Index: {uvIndex} — {uv.label}</span>
            </div>
          </div>
        </div>

        {/* Wind & Visibility */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">☄ Wind / Visibility</div>
            <span className="badge badge-info">ESTIMATE</span>
          </div>
          <div style={{ padding: '14px' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginBottom: 4, letterSpacing: 1 }}>WIND SPEED (EST.)</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 800, color: C.blue }}>{windSpeed} <span style={{ fontSize: 12, fontWeight: 400 }}>km/h</span></div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginBottom: 4, letterSpacing: 1 }}>VISIBILITY</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, color: light.color }}>{visibility}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Rainfall trend + 7-day summary ── */}
      <div className="g21 mt">
        {/* Rainfall + Pressure trend chart */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">☄ Rainfall & Pressure Trend — 30 Readings</div>
          </div>
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={rainHistory} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-rain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis yAxisId="rain" domain={[0, 15]} hide />
                <YAxis yAxisId="pres" orientation="right" domain={[995, 1030]} hide />
                <Tooltip content={<ChartTip />} />
                <Area yAxisId="rain" type="monotone" dataKey="rain" name="Rain (mm/hr)" stroke={C.blue} fill="url(#g-rain)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── FEATURE 45: 7-day summary ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">7-Day Summary</div>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {weekSummary.map((day, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 6 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', width: 28 }}>{day.day}</span>
                <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (day.rain / 8) * 100)}%`, background: rainStatus(day.rain).color, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: rainStatus(day.rain).color, width: 45, textAlign: 'right' }}>{day.rain}mm</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: C.yellow, width: 30, textAlign: 'right' }}>{day.temp}°C</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Weather warning system ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">Weather Advisory</div>
        </div>
        <div className="rec-list">
          <div className="rec-item">
            <div className="rec-icon" style={{ color: rain.color }}>☄</div>
            <div className="rec-text"><strong>Rainfall: {rain.label}.</strong> {rain.floodRisk === 'LOW' ? 'No flood risk from precipitation. Drain sensors nominal.' : rain.floodRisk === 'MODERATE' ? 'Monitor drain sensors. Rainfall may contribute to surface runoff.' : 'High flood risk from rainfall. Drain alert thresholds likely to trigger. Prepare flood response.'}</div>
          </div>
          <div className="rec-item">
            <div className="rec-icon" style={{ color: trend.color }}>{trend.icon}</div>
            <div className="rec-text"><strong>Pressure trend: {trend.label}.</strong> {trend.label === 'IMPROVING' ? 'Clearing conditions expected. Good for outdoor maintenance.' : trend.label === 'STABLE' ? 'Stable conditions. Normal monitoring schedule.' : 'Deteriorating conditions may signal incoming precipitation or storm system.'}</div>
          </div>
          {uvIndex >= 6 && (
            <div className="rec-item">
              <div className="rec-icon" style={{ color: uv.color }}>UV</div>
              <div className="rec-text"><strong>UV Index {uvIndex} — {uv.label}.</strong> Apply SPF 30+ sunscreen. Limit unprotected sun exposure to under 20 minutes during peak hours (10:00–14:00).</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
