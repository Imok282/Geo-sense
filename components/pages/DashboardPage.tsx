
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { PageId } from '../../App';

interface Props {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
  onNavigate: (p: PageId) => void;
}

// ─── CHART COLORS ─────────────────────────────────────────────────────────────
const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

const mkData = (arr: number[]) => arr.map((v, i) => ({ i, v: parseFloat(v.toFixed(2)) }));

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

// ─── MINI AREA CHART ──────────────────────────────────────────────────────────
const MiniChart = ({ data: arr, color, uid }: { data: number[]; color: string; uid: string }) => (
  <ResponsiveContainer width="100%" height={70}>
    <AreaChart data={mkData(arr)} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0}   />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" name="val" stroke={color} fill={`url(#g-${uid})`} strokeWidth={1.5} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── STAT BOX ─────────────────────────────────────────────────────────────────
const Stat = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div className="stat-cell">
    <div className="sc-label">{label}</div>
    <div className="sc-val" style={color ? { color } : undefined}>{value}</div>
  </div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
function badge(score: number) {
  return score > 66 ? 'badge-danger' : score > 33 ? 'badge-warn' : 'badge-safe';
}
function blabel(score: number) {
  return score > 66 ? 'DANGER' : score > 33 ? 'WARNING' : 'SAFE';
}

// ─── TANK FILL % ──────────────────────────────────────────────────────────────
const tankPct = (w2: number) =>
  w2 >= 0 ? Math.max(0, Math.min(100, Math.round((1 - w2 / 100) * 100))) : null;

// ─── FEATURE 111: Data freshness indicator ────────────────────────────────────
const useFreshness = () => {
  const [lastUpdate, setLastUpdate] = React.useState(Date.now());
  const [age, setAge] = React.useState(0);
  React.useEffect(() => { setLastUpdate(Date.now()); setAge(0); }, []);
  React.useEffect(() => {
    const t = setInterval(() => setAge(a => a + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fresh = age < 8;
  return { age, fresh, color: fresh ? C.green : age < 20 ? C.yellow : C.red };
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
const DashboardPage: React.FC<Props> = ({ data, history, risks, onNavigate }) => {
  const tds  = data?.tds  ?? 0;
  const w1   = data?.w1   ?? -1;
  const w2   = data?.w2   ?? -1;
  const tank = tankPct(w2);

  const tdsColor   = tds > 500 ? C.red : tds > 300 ? C.yellow : C.blue;
  const drainColor = w1 < 5 ? C.red : w1 < 15 ? C.yellow : C.green;
  const tankColor  = (tank ?? 0) > 90 ? C.red : (tank ?? 0) > 70 ? C.yellow : C.green;

  const drainStatus = w1 < 0 ? 'NO ECHO' : w1 < 5 ? 'OVERFLOW' : w1 < 15 ? 'WARNING' : 'SAFE';
  const tankStatus  = tank === null ? 'NO ECHO' : tank > 90 ? 'FULL' : tank > 70 ? 'HIGH' : 'NORMAL';
  const tdsStatus   = tds > 500 ? 'DANGER' : tds > 300 ? 'WARNING' : 'SAFE';

  // ─── FEATURE 111: Freshness ────────────────────────────────────────────────
  const freshness = useFreshness();

  // ─── FEATURE 112: Rolling statistics ──────────────────────────────────────
  const tdsArr = history.tds;
  const tdsAvg = tdsArr.length ? Math.round(tdsArr.reduce((a, b) => a + b, 0) / tdsArr.length) : 0;
  const tdsMin = tdsArr.length ? Math.round(Math.min(...tdsArr)) : 0;
  const tdsMax = tdsArr.length ? Math.round(Math.max(...tdsArr)) : 0;

  // ─── FEATURE 113: Rate of change ──────────────────────────────────────────
  const tdsRate = tdsArr.length >= 2
    ? Math.round((tdsArr[tdsArr.length - 1] - tdsArr[tdsArr.length - 2]) * 10) / 10
    : 0;
  const tdsRateLabel = tdsRate > 1 ? `↑ +${tdsRate}` : tdsRate < -1 ? `↓ ${tdsRate}` : '→ stable';
  const tdsRateColor = tdsRate > 5 ? C.red : tdsRate > 1 ? C.yellow : tdsRate < -1 ? C.teal : C.green;

  // ─── FEATURE 114: Anomaly detection ───────────────────────────────────────
  const stdDev = tdsArr.length > 2
    ? Math.sqrt(tdsArr.reduce((a, b) => a + (b - tdsAvg) ** 2, 0) / tdsArr.length)
    : 0;
  const isAnomaly = tdsArr.length > 5 && Math.abs(tds - tdsAvg) > stdDev * 2.5;

  // ─── FEATURE 115: Tank fill visual gauge ──────────────────────────────────
  const tankFillPct = tank ?? 0;

  // Combined water level chart data
  const waterChartData = history.w1.map((v, i) => ({
    i,
    drain: parseFloat(v.toFixed(1)),
    tank:  parseFloat((history.w2[i] ?? 50).toFixed(1)),
  }));

  return (
    <div className="page">
      {/* ─── FEATURE 111: Freshness + reading stats bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, padding: '8px 12px', background: 'var(--s1)', borderRadius: 8, border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: freshness.color, boxShadow: `0 0 6px ${freshness.color}`, animation: freshness.fresh ? 'livepulse 2s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: freshness.color, letterSpacing: 1 }}>
            {freshness.fresh ? 'LIVE' : `LAST UPDATE ${freshness.age}s AGO`}
          </span>
        </div>
        <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
        {/* ─── FEATURE 112: Stats pills ── */}
        {[
          { label: 'AVG TDS', val: `${tdsAvg} ppm`, color: tdsColor },
          { label: 'MIN',     val: `${tdsMin} ppm`, color: C.green  },
          { label: 'MAX',     val: `${tdsMax} ppm`, color: tdsMax > 500 ? C.red : C.yellow },
          { label: 'TREND',   val: tdsRateLabel,    color: tdsRateColor },
        ].map((s, i) => (
          <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>
            {s.label}: <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span>
          </div>
        ))}
        {/* ─── FEATURE 114: Anomaly badge ── */}
        {isAnomaly && (
          <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,45,85,0.15)', color: C.red, border: '1px solid rgba(255,45,85,0.3)', animation: 'bwarn 1s step-end infinite' }}>
            ⚡ ANOMALY DETECTED
          </div>
        )}
      </div>

      {/* ── ROW 1: Four metric cards ── */}
      <div className="g4">

        {/* TDS / Water Quality */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('tds')}>
          <div className="card-h">
            <div className="card-title">⚗ Water Quality</div>
            <span className={`badge ${badge(risks.tds)}`}>{tdsStatus}</span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: tdsColor }}>{Math.round(tds)}</span>
            <span className="bn-unit">ppm</span>
            <div className="bn-label">TDS · WHO threshold 500 ppm</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: tdsColor }} />
              <span className="status-txt" style={{ color: tdsColor }}>{tdsStatus}</span>
            </div>
          </div>
          <div className="chart-box short">
            <MiniChart data={history.tds} color={tdsColor} uid="tds" />
          </div>
        </div>

        {/* Drain Overflow */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('flood')}>
          <div className="card-h">
            <div className="card-title">≉ Drain Overflow</div>
            <span className={`badge ${drainStatus === 'OVERFLOW' ? 'badge-danger' : drainStatus === 'WARNING' ? 'badge-warn' : drainStatus === 'SAFE' ? 'badge-safe' : 'badge-info'}`}>
              {drainStatus}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: drainColor }}>
              {w1 >= 0 ? w1.toFixed(1) : '--'}
            </span>
            <span className="bn-unit">cm</span>
            <div className="bn-label">HC-SR04 #1 · Distance to water surface</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: drainColor }} />
              <span className="status-txt" style={{ color: drainColor }}>{drainStatus}</span>
            </div>
          </div>
          <div className="chart-box short">
            <MiniChart data={history.w1} color={C.blue} uid="w1" />
          </div>
        </div>

        {/* Tank Level */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('flood')}>
          <div className="card-h">
            <div className="card-title">≉ Tank Level</div>
            <span className={`badge ${tank === null ? 'badge-info' : tank > 90 ? 'badge-danger' : tank > 70 ? 'badge-warn' : 'badge-safe'}`}>
              {tankStatus}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color: tankColor }}>
              {tank !== null ? tank : '--'}
            </span>
            <span className="bn-unit">%</span>
            <div className="bn-label">HC-SR04 #2 · {w2 >= 0 ? `${w2.toFixed(1)} cm from sensor` : 'no echo'}</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: tankColor }} />
              <span className="status-txt" style={{ color: tankColor }}>{tankStatus}</span>
            </div>
          </div>
          <div className="chart-box short">
            <MiniChart data={history.w2.map(v => Math.max(0, Math.min(100, Math.round((1 - v / 100) * 100))))} color={C.teal} uid="w2" />
          </div>
        </div>

        {/* Composite Risk */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('risk')}>
          <div className="card-h">
            <div className="card-title">⚲ Composite Risk</div>
            <span className={`badge ${badge(risks.composite)}`}>{blabel(risks.composite)}</span>
          </div>
          <div className="composite" style={{ padding: '16px 14px' }}>
            <div
              className="comp-num"
              style={{
                fontSize: 56,
                color: risks.composite > 66 ? C.red : risks.composite > 33 ? C.yellow : C.green,
              }}
            >
              {risks.composite}
            </div>
            <div className="comp-label">out of 100</div>
            <div
              className="comp-status"
              style={{
                fontSize: 10,
                color: risks.composite > 66 ? C.red : risks.composite > 33 ? C.yellow : C.green,
              }}
            >
              {risks.composite > 66 ? 'HIGH RISK' : risks.composite > 33 ? 'MODERATE RISK' : 'ALL CLEAR'}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Trend charts ── */}
      <div className="g2 mt">

        {/* TDS Trend */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚗ TDS Trend — last 30 readings</div>
            <span className="badge badge-info">{history.tds.length} pts</span>
          </div>
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={mkData(history.tds)} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-tds-big" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={[0, 700]} hide />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="v" name="TDS (ppm)" stroke={C.blue} fill="url(#g-tds-big)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            {/* WHO threshold reference */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ width: 20, height: 1, background: C.red, opacity: 0.5 }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>WHO SAFE THRESHOLD 500 ppm</span>
            </div>
          </div>
        </div>

        {/* Water Level Trend */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">≉ Water Distance — Drain &amp; Tank</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-info">HC-SR04 ×2</span>
            </div>
          </div>
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={waterChartData} margin={{ top: 8, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g-drain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.blue} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="g-tank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.teal} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.teal} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis hide />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="drain" name="Drain (cm)" stroke={C.blue} fill="url(#g-drain)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="tank"  name="Tank (cm)"  stroke={C.teal} fill="url(#g-tank)"  strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 2, background: C.blue, borderRadius: 1 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>HC-SR04 #1 DRAIN</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 2, background: C.teal, borderRadius: 1 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>HC-SR04 #2 TANK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Node stats + Tank fill gauge ── */}
      <div className="g2 mt">
        <div className="card">
          <div className="card-h">
            <div className="card-title">⬡ Node Health</div>
            <span className="badge badge-safe">ONLINE</span>
          </div>
          <div className="stat-grid">
            <Stat label="TDS Risk"    value={`${risks.tds} / 100`}     color={risks.tds > 66 ? C.red : risks.tds > 33 ? C.yellow : C.green} />
            <Stat label="Flood Risk"  value={`${risks.flood} / 100`}   color={risks.flood > 66 ? C.red : risks.flood > 33 ? C.yellow : C.green} />
            <Stat label="WiFi RSSI"   value={data ? `${Math.round(data.rssi)} dBm` : '--'} color={C.blue} />
            <Stat label="Node Uptime" value={data ? `${data.uptime}s` : '--'} />
            <Stat label="Drain Score" value={`${risks.drain} / 100`}   color={risks.drain > 66 ? C.red : risks.drain > 33 ? C.yellow : C.green} />
            <Stat label="Std Dev TDS" value={tdsArr.length > 2 ? `${Math.round(Math.sqrt(tdsArr.reduce((a, b) => a + (b - tdsAvg) ** 2, 0) / tdsArr.length))} ppm` : '--'} color={C.teal} />
          </div>
        </div>

        {/* ─── FEATURE 115: Tank fill visual gauge ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">≉ Tank Fill Level</div>
            <span className={`badge ${tankFillPct > 90 ? 'badge-danger' : tankFillPct > 70 ? 'badge-warn' : 'badge-safe'}`}>{tankStatus}</span>
          </div>
          <div style={{ padding: '14px', display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            {/* Cylinder visual */}
            <div style={{ width: 48, height: 120, border: `2px solid ${tankColor}`, borderRadius: '4px 4px 6px 6px', position: 'relative', overflow: 'hidden', background: 'var(--s2)', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${tankFillPct}%`,
                background: `linear-gradient(180deg, ${tankColor}80, ${tankColor}40)`,
                transition: 'height 0.8s ease',
                borderTop: `1px solid ${tankColor}`,
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, color: tankColor }}>{tankFillPct}%</div>
            </div>
            <div style={{ flex: 1 }}>
              {[100, 75, 50, 25, 0].map(mark => (
                <div key={mark} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: tankFillPct >= mark ? tankColor : 'var(--dim)' }}>{mark}%</span>
                </div>
              ))}
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginTop: 8 }}>
                HC-SR04 #2 · {w2 >= 0 ? `${w2.toFixed(1)} cm` : 'No echo'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OFFLINE SENSORS NOTICE ── */}
      <div className="insight mt" style={{ borderColor: 'var(--dim)' }}>
        <div className="insight-title" style={{ color: 'var(--dim)' }}>Offline Sensors</div>
        <div className="insight-body">
          The following sensors are not wired on this node and show N/A:
          <strong> DHT22</strong> (Heat Stress),
          <strong> MQ-135</strong> (Air Quality),
          <strong> MPU6050/ADXL345</strong> (Structural/Seismic),
          <strong> Rain FC-37/BH1750</strong> (Weather),
          <strong> NEO-6M</strong> (GPS).
          Navigate to any offline section for wiring instructions.
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
