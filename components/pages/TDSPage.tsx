
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

// TDS quality bands
const TDS_SCALE = [
  { range: '0 – 50 ppm',   label: 'Ultra Pure',    impact: 'Distilled / RO water',           color: C.teal  },
  { range: '50 – 150 ppm', label: 'Excellent',      impact: 'Ideal for drinking',              color: C.green },
  { range: '150 – 300 ppm',label: 'Good',           impact: 'Acceptable, typical tap water',   color: C.blue  },
  { range: '300 – 500 ppm',label: 'Borderline',     impact: 'Monitor, approaching WHO limit',  color: C.yellow },
  { range: '500 – 1000 ppm',label:'Non-Compliant',  impact: 'Exceeds WHO 500 ppm guideline',   color: '#ff6820' },
  { range: '> 1000 ppm',   label: 'Contaminated',  impact: 'Unsafe — immediate action needed',color: C.red   },
];

function tdsColor(ppm: number) {
  if (ppm < 50)   return C.teal;
  if (ppm < 150)  return C.green;
  if (ppm < 300)  return C.blue;
  if (ppm < 500)  return C.yellow;
  if (ppm < 1000) return '#ff6820';
  return C.red;
}
function tdsQuality(ppm: number) {
  if (ppm < 50)   return 'ULTRA PURE';
  if (ppm < 150)  return 'EXCELLENT';
  if (ppm < 300)  return 'GOOD';
  if (ppm < 500)  return 'BORDERLINE';
  if (ppm < 1000) return 'NON-COMPLIANT';
  return 'CONTAMINATED';
}
function tdsAlertClass(ppm: number) {
  return ppm < 300 ? 'as-safe' : ppm < 500 ? 'as-warn' : 'as-danger';
}
function tdsAlertMsg(ppm: number) {
  if (ppm < 150)  return 'Water quality is excellent. No action required.';
  if (ppm < 300)  return 'Good water quality. Routine monitoring recommended.';
  if (ppm < 500)  return 'Approaching WHO limit. Investigate source and test more frequently.';
  if (ppm < 1000) return 'Exceeds WHO 500 ppm guideline. Restrict use, test water source, consider filtration.';
  return 'Severely contaminated. Cease use immediately. Conduct emergency water quality test.';
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.s2, border: `1px solid ${C.dim}`, borderRadius: 5, padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 9 }}>
      <div style={{ color: C.blue }}>{payload[0]?.name}: {payload[0]?.value} ppm</div>
    </div>
  );
};

// ─── TDS PAGE ─────────────────────────────────────────────────────────────────
const TDSPage: React.FC<Props> = ({ data, history, risks }) => {
  const tds    = data?.tds ?? 0;
  const color  = tdsColor(tds);
  const pct    = Math.min(100, (tds / 600) * 100); // bar width (600 = visual max)
  const mkData = (arr: number[]) => arr.map((v, i) => ({ i, v: parseFloat(v.toFixed(1)) }));

  // Stats
  const arr = history.tds;
  const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const min = arr.length ? Math.round(Math.min(...arr)) : 0;
  const max = arr.length ? Math.round(Math.max(...arr)) : 0;
  const trend = arr.length >= 2
    ? arr[arr.length - 1] > arr[arr.length - 2] ? '↑ Rising' : arr[arr.length - 1] < arr[arr.length - 2] ? '↓ Falling' : '→ Stable'
    : '→ Stable';

  const currentBandIndex = TDS_SCALE.findIndex((_, i) => {
    const thresholds = [0, 50, 150, 300, 500, 1000];
    return tds >= thresholds[i] && tds < (thresholds[i + 1] ?? Infinity);
  });

  return (
    <div className="page">
      {/* ── Alert strip ── */}
      <div className={`alert-strip ${tdsAlertClass(tds)}`}>
        <span>⚗</span>
        <span>{tdsAlertMsg(tds)}</span>
      </div>

      {/* ── Row 1: Big number + health scale ── */}
      <div className="g12 mt">

        {/* Big TDS reading */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">⚗ TDS Sensor Reading</div>
            <span className="badge" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
              {tdsQuality(tds)}
            </span>
          </div>
          <div className="big-num">
            <span className="bn-val" style={{ color }}>{Math.round(tds)}</span>
            <span className="bn-unit">ppm</span>
            <div className="bn-label">Total Dissolved Solids · GPIO 35</div>
            <div className="bn-status">
              <div className="status-dot" style={{ background: color }} />
              <span className="status-txt" style={{ color }}>{tdsQuality(tds)}</span>
            </div>
          </div>

          {/* WHO comparison bar */}
          <div style={{ padding: '4px 14px 16px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginBottom: 6, letterSpacing: 1 }}>
              READING vs WHO GUIDELINE (500 ppm)
            </div>
            <div style={{ position: 'relative', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
              {/* WHO threshold marker at ~83% (500/600) */}
              <div style={{ position: 'absolute', top: 0, left: '83.3%', height: '100%', width: 2, background: C.red, opacity: 0.7 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>0 ppm</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: C.red }}>WHO 500 ppm</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>600+ ppm</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stat-grid" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="stat-cell">
              <div className="sc-label">Average</div>
              <div className="sc-val" style={{ color }}>{avg} ppm</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Trend</div>
              <div className="sc-val" style={{ color: 'var(--mid)', fontSize: 12 }}>{trend}</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Session Min</div>
              <div className="sc-val c-green">{min} ppm</div>
            </div>
            <div className="stat-cell">
              <div className="sc-label">Session Max</div>
              <div className="sc-val" style={{ color: max > 500 ? C.red : max > 300 ? C.yellow : C.green }}>{max} ppm</div>
            </div>
          </div>
        </div>

        {/* Health scale */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">TDS Quality Scale</div>
          </div>
          <div className="hscale">
            {TDS_SCALE.map((row, i) => (
              <div key={i} className={`hs-row${i === currentBandIndex ? ' active' : ''}`}>
                <div className="hs-dot" style={{ background: row.color }} />
                <div className="hs-range">{row.range}</div>
                <div className="hs-label" style={{ color: i === currentBandIndex ? row.color : 'var(--mid)' }}>{row.label}</div>
                <div className="hs-impact">{row.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: TDS Trend chart ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">TDS Trend — Last {history.tds.length} readings</div>
          <span className="badge badge-info">{avg} ppm avg</span>
        </div>
        <div className="chart-box tall">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mkData(arr)} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="g-tds-pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis domain={[0, Math.max(600, max + 50)]} hide />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={500} stroke={C.red} strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'WHO 500', position: 'right', fontSize: 8, fill: C.red, fontFamily: 'monospace' }} />
              <ReferenceLine y={300} stroke={C.yellow} strokeDasharray="3 3" strokeOpacity={0.4} />
              <Area type="monotone" dataKey="v" name="TDS" stroke={color} fill="url(#g-tds-pg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Recommendations ── */}
      <div className="card mt">
        <div className="card-h">
          <div className="card-title">Action Recommendations</div>
        </div>
        <div className="rec-list">
          {tds < 300 && (
            <>
              <div className="rec-item">
                <div className="rec-icon">✓</div>
                <div className="rec-text"><strong>Continue routine monitoring.</strong> TDS is within safe range. Log daily readings and set an alert threshold at 400 ppm for early warning.</div>
              </div>
              <div className="rec-item">
                <div className="rec-icon">⚗</div>
                <div className="rec-text"><strong>Calibrate sensor monthly.</strong> Use a known-concentration TDS calibration solution (e.g. 342 ppm KCl standard) to verify probe accuracy.</div>
              </div>
              <div className="rec-item">
                <div className="rec-icon">📋</div>
                <div className="rec-text"><strong>Baseline documentation.</strong> Record current seasonal baseline. Elevated readings in monsoon season may indicate surface runoff contamination.</div>
              </div>
            </>
          )}
          {tds >= 300 && tds < 500 && (
            <>
              <div className="rec-item">
                <div className="rec-icon">⚠</div>
                <div className="rec-text"><strong>Increase sampling frequency.</strong> Borderline TDS detected. Sample every 30 minutes and document trend direction to assess if contamination is increasing.</div>
              </div>
              <div className="rec-item">
                <div className="rec-icon">🔍</div>
                <div className="rec-text"><strong>Investigate source.</strong> Check for upstream inputs — construction, chemical storage, agricultural runoff, or plumbing leach could be contributing to elevated solids.</div>
              </div>
              <div className="rec-item">
                <div className="rec-icon">🧪</div>
                <div className="rec-text"><strong>Lab verification recommended.</strong> Send a water sample for certified laboratory analysis to identify specific dissolved solids beyond what this sensor can resolve.</div>
              </div>
            </>
          )}
          {tds >= 500 && (
            <>
              <div className="rec-item">
                <div className="rec-icon">🚨</div>
                <div className="rec-text"><strong>WHO threshold exceeded.</strong> Restrict use of this water source immediately. Notify the facilities team and initiate a water quality incident report.</div>
              </div>
              <div className="rec-item">
                <div className="rec-icon">🚰</div>
                <div className="rec-text"><strong>Deploy emergency filtration.</strong> A reverse osmosis or activated carbon filter should be installed at the point-of-use until readings return below 500 ppm.</div>
              </div>
              <div className="rec-item">
                <div className="rec-icon">📞</div>
                <div className="rec-text"><strong>Report to water authority.</strong> Contamination at this level may indicate a systemic supply issue. File a report with the local municipal water authority for network-wide investigation.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TDSPage;
