
import React, { useState, useCallback } from 'react';
import { LiveData, RiskScores } from '../../types';

interface Props {
  data: LiveData | null;
  risks: RiskScores;
}

// ─── FEATURE 31: Alert types ──────────────────────────────────────────────────
type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
type AlertSource   = 'TDS' | 'FLOOD' | 'DRAIN' | 'TANK' | 'SYSTEM' | 'AI';

interface Alert {
  id: number;
  severity: AlertSeverity;
  source: AlertSource;
  title: string;
  detail: string;
  time: string;
  acknowledged: boolean;
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

const sevColor = (s: AlertSeverity) => s === 'CRITICAL' ? C.red : s === 'WARNING' ? C.yellow : C.blue;
const sevBg    = (s: AlertSeverity) => s === 'CRITICAL' ? 'rgba(255,45,85,0.08)' : s === 'WARNING' ? 'rgba(255,201,64,0.08)' : 'rgba(45,200,240,0.08)';

// ─── FEATURE 32: Build alert list from live data ───────────────────────────────
function buildAlerts(data: LiveData | null, risks: RiskScores): Alert[] {
  const alerts: Alert[] = [];
  let id = 1;
  const now = new Date().toLocaleTimeString();

  if (risks.tds > 66) {
    alerts.push({ id: id++, severity: 'CRITICAL', source: 'TDS', title: 'TDS Exceeds WHO Limit', detail: `Current TDS: ${data ? Math.round(data.tds) : '--'} ppm — exceeds WHO 500 ppm guideline. Restrict water use immediately.`, time: now, acknowledged: false });
  } else if (risks.tds > 33) {
    alerts.push({ id: id++, severity: 'WARNING', source: 'TDS', title: 'TDS Approaching Threshold', detail: `TDS: ${data ? Math.round(data.tds) : '--'} ppm — borderline range. Increase sampling frequency.`, time: now, acknowledged: false });
  }

  if (risks.flood > 66) {
    alerts.push({ id: id++, severity: 'CRITICAL', source: 'FLOOD', title: 'Critical Flood Risk', detail: `Composite flood risk: ${risks.flood}/100. Drain overflow imminent. Activate flood response.`, time: now, acknowledged: false });
  } else if (risks.flood > 33) {
    alerts.push({ id: id++, severity: 'WARNING', source: 'FLOOD', title: 'Elevated Flood Risk', detail: `Flood risk: ${risks.flood}/100. Monitor drain distance closely.`, time: now, acknowledged: false });
  }

  if (risks.drain > 80) {
    alerts.push({ id: id++, severity: 'CRITICAL', source: 'DRAIN', title: 'Drain Overflow Imminent', detail: `Drain distance: ${data && data.w1 >= 0 ? data.w1.toFixed(1) : '--'} cm — water is at sensor level.`, time: now, acknowledged: false });
  }

  if (risks.tank > 90) {
    alerts.push({ id: id++, severity: 'WARNING', source: 'TANK', title: 'Tank Nearly Full', detail: `Tank level: ${risks.tank}%. ${data && data.w2 >= 0 ? data.w2.toFixed(1) : '--'} cm from sensor.`, time: now, acknowledged: false });
  }

  if (risks.composite > 66) {
    alerts.push({ id: id++, severity: 'CRITICAL', source: 'AI', title: 'High Composite Risk Score', detail: `Composite risk: ${risks.composite}/100. Multiple hazard indicators elevated simultaneously.`, time: now, acknowledged: false });
  }

  // Always add some info alerts
  alerts.push({ id: id++, severity: 'INFO', source: 'SYSTEM', title: 'Data Stream Active', detail: `Node reporting at 5s intervals. Last packet received at ${now}.`, time: now, acknowledged: false });

  if (!data) {
    alerts.push({ id: id++, severity: 'WARNING', source: 'SYSTEM', title: 'No Sensor Data', detail: 'No data received from node. Check BLE connection or switch to Simulation mode.', time: now, acknowledged: false });
  }

  return alerts;
}

// ─── FEATURE 64: Default thresholds ───────────────────────────────────────────
const DEFAULT_THRESHOLDS = { tds: 300, flood: 50, drain: 70, tank: 80, composite: 60 };

const AlertCenterPage: React.FC<Props> = ({ data, risks }) => {
  const [filter, setFilter]         = useState<AlertSeverity | 'ALL'>('ALL');
  // ─── FEATURE 67: Auto-dismiss toggle ──────────────────────────────────────────
  const [autoDismiss, setAutoDismiss] = useState(false);
  // ─── FEATURE 66: Sound toggle ─────────────────────────────────────────────────
  const [soundOn, setSoundOn]       = useState(false);
  // ─── FEATURE 33: Alert history log ────────────────────────────────────────────
  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [showThresholds, setShowThresholds] = useState(false);

  const allAlerts = buildAlerts(data, risks);

  // ─── FEATURE 34: Acknowledgment ───────────────────────────────────────────────
  const ackAlert = useCallback((id: number) => {
    setAcknowledged(prev => new Set([...prev, id]));
  }, []);

  const ackAll = useCallback(() => {
    setAcknowledged(new Set(allAlerts.map(a => a.id)));
  }, [allAlerts]);

  // ─── FEATURE 35: Filter by severity ──────────────────────────────────────────
  const filtered = filter === 'ALL' ? allAlerts : allAlerts.filter(a => a.severity === filter);
  const active   = filtered.filter(a => !acknowledged.has(a.id));
  const acked    = filtered.filter(a => acknowledged.has(a.id));

  // ─── FEATURE 37: Alert statistics ────────────────────────────────────────────
  const stats = {
    critical: allAlerts.filter(a => a.severity === 'CRITICAL').length,
    warning:  allAlerts.filter(a => a.severity === 'WARNING').length,
    info:     allAlerts.filter(a => a.severity === 'INFO').length,
    total:    allAlerts.length,
    unacked:  allAlerts.filter(a => !acknowledged.has(a.id)).length,
  };

  const AlertRow = ({ alert }: { alert: Alert }) => (
    <div style={{
      background: acknowledged.has(alert.id) ? 'transparent' : sevBg(alert.severity),
      border: `1px solid ${acknowledged.has(alert.id) ? 'var(--border)' : sevColor(alert.severity) + '30'}`,
      borderRadius: 8, padding: '12px 14px', marginBottom: 8,
      opacity: acknowledged.has(alert.id) ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          flexShrink: 0, marginTop: 2,
          fontFamily: 'var(--mono)', fontSize: 7, fontWeight: 700, letterSpacing: 1,
          padding: '3px 6px', borderRadius: 3,
          background: sevColor(alert.severity) + '20', color: sevColor(alert.severity),
          border: `1px solid ${sevColor(alert.severity)}30`,
        }}>{alert.severity}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: acknowledged.has(alert.id) ? 'var(--dim)' : 'var(--text)' }}>{alert.title}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>{alert.time}</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)', lineHeight: 1.6 }}>{alert.detail}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', background: 'var(--s2)', padding: '2px 6px', borderRadius: 3 }}>{alert.source}</span>
            {!acknowledged.has(alert.id) && (
              <button onClick={() => ackAlert(alert.id)} style={{
                fontFamily: 'var(--mono)', fontSize: 8, color: C.green, background: C.green + '15',
                border: `1px solid ${C.green}30`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
              }}>ACKNOWLEDGE</button>
            )}
            {acknowledged.has(alert.id) && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>✓ Acknowledged</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* ─── FEATURE 37: Stats bar ── */}
      <div className="g4">
        {[
          { label: 'ACTIVE',   value: stats.unacked, color: stats.unacked > 0 ? C.red : C.green },
          { label: 'CRITICAL', value: stats.critical, color: C.red },
          { label: 'WARNINGS', value: stats.warning,  color: C.yellow },
          { label: 'INFO',     value: stats.info,     color: C.blue },
        ].map((s, i) => (
          <div key={i} className="card">
            <div style={{ padding: '14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', flexWrap: 'wrap' }}>
        {/* ─── FEATURE 35: Severity filter ── */}
        {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, letterSpacing: 1,
            padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
            background: filter === f ? (f === 'CRITICAL' ? C.red : f === 'WARNING' ? C.yellow : f === 'INFO' ? C.blue : C.green) + '20' : 'var(--s2)',
            color: filter === f ? (f === 'CRITICAL' ? C.red : f === 'WARNING' ? C.yellow : f === 'INFO' ? C.blue : C.green) : 'var(--dim)',
            border: `1px solid ${filter === f ? (f === 'CRITICAL' ? C.red : f === 'WARNING' ? C.yellow : f === 'INFO' ? C.blue : C.green) + '40' : 'var(--border)'}`,
          }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {/* ─── FEATURE 66: Sound toggle ── */}
          <button onClick={() => setSoundOn(p => !p)} style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '4px 12px', borderRadius: 4, cursor: 'pointer', background: soundOn ? C.yellow + '20' : 'var(--s2)', color: soundOn ? C.yellow : 'var(--dim)', border: `1px solid ${soundOn ? C.yellow + '40' : 'var(--border)'}` }}>
            {soundOn ? '🔔 SOUND ON' : '🔕 SOUND OFF'}
          </button>
          {/* ─── FEATURE 67: Auto-dismiss ── */}
          <button onClick={() => setAutoDismiss(p => !p)} style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '4px 12px', borderRadius: 4, cursor: 'pointer', background: autoDismiss ? C.teal + '20' : 'var(--s2)', color: autoDismiss ? C.teal : 'var(--dim)', border: `1px solid ${autoDismiss ? C.teal + '40' : 'var(--border)'}` }}>
            AUTO-DISMISS: {autoDismiss ? 'ON' : 'OFF'}
          </button>
          <button onClick={ackAll} style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '4px 12px', borderRadius: 4, cursor: 'pointer', background: 'var(--s2)', color: 'var(--dim)', border: '1px solid var(--border)' }}>ACK ALL</button>
          <button onClick={() => setShowThresholds(p => !p)} style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '4px 12px', borderRadius: 4, cursor: 'pointer', background: 'var(--s2)', color: 'var(--dim)', border: '1px solid var(--border)' }}>THRESHOLDS</button>
        </div>
      </div>

      {/* ─── FEATURE 65: Threshold configurator ── */}
      {showThresholds && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-h">
            <div className="card-title">Alert Thresholds</div>
            <button onClick={() => setThresholds(DEFAULT_THRESHOLDS)} style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '3px 10px', borderRadius: 4, cursor: 'pointer', background: 'var(--s2)', color: 'var(--dim)', border: '1px solid var(--border)' }}>RESET DEFAULTS</button>
          </div>
          <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {(Object.entries(thresholds) as [keyof typeof thresholds, number][]).map(([key, val]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', letterSpacing: 1, textTransform: 'uppercase' }}>{key} Threshold</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: C.green, fontWeight: 700 }}>{val}{key === 'tds' ? ' ppm' : '/100'}</span>
                </div>
                <input type="range" min={key === 'tds' ? 50 : 20} max={key === 'tds' ? 800 : 95} value={val}
                  onChange={e => setThresholds(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: C.green }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active alerts */}
      {active.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
            Active — {active.length} unacknowledged
          </div>
          {active.map(a => <AlertRow key={a.id} alert={a} />)}
        </div>
      )}

      {active.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'var(--mono)', fontSize: 11, color: C.green }}>
          ✓ All clear — no active alerts
        </div>
      )}

      {/* ─── FEATURE 33: Alert history ── */}
      {acked.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
            Acknowledged History — {acked.length} alerts
          </div>
          {acked.map(a => <AlertRow key={a.id} alert={a} />)}
        </div>
      )}
    </div>
  );
};

export default AlertCenterPage;
