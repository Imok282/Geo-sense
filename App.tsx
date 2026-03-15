
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LiveData, HistoryData, RiskScores } from './types';
import { subscribeToNode } from './services/firebaseService';
import DashboardPage from './components/pages/DashboardPage';
import RiskRadarPage from './components/pages/RiskRadarPage';
import TDSPage from './components/pages/TDSPage';
import FloodPage from './components/pages/FloodPage';
import SensorOfflinePage from './components/pages/SensorOfflinePage';

// ─── PAGE ROUTING ─────────────────────────────────────────────────────────────
export type PageId =
  | 'overview' | 'risk'
  | 'heat' | 'air' | 'flood' | 'tds' | 'structural' | 'weather' | 'seismic' | 'gps';

const PAGE_TITLES: Record<PageId, string> = {
  overview:   'DASHBOARD',
  risk:       'RISK RADAR',
  heat:       'HEAT & CLIMATE',
  air:        'AIR QUALITY MATRIX',
  flood:      'HYDRO DYNAMICS',
  tds:        'WATER CONTAMINATION',
  structural: 'STRUCTURAL HEALTH',
  weather:    'WEATHER SYSTEMS',
  seismic:    'SEISMIC ACTIVITY',
  gps:        'SATELLITE LINK',
};

// ─── RISK COMPUTATION ─────────────────────────────────────────────────────────
export function computeRisks(d: LiveData): RiskScores {
  const tds   = Math.min(100, Math.max(0, Math.round((d.tds / 500) * 100)));
  const drain = d.w1 >= 0
    ? Math.min(100, Math.max(0, Math.round((1 - d.w1 / 30) * 100)))
    : 0;
  const tank  = d.w2 >= 0
    ? Math.max(0, Math.min(100, Math.round((1 - d.w2 / 100) * 100)))
    : 50;
  const flood     = Math.round(drain * 0.7 + tank * 0.3);
  const composite = Math.round((tds + flood) / 2);
  return { tds, flood, drain, tank, composite };
}

const EMPTY_RISKS: RiskScores = { tds: 0, flood: 0, drain: 0, tank: 0, composite: 0 };

// ─── DEMO DATA GENERATOR ──────────────────────────────────────────────────────
function genDemo(tick: number): LiveData {
  const t = tick * 0.15;
  return {
    tds:    220 + Math.sin(t * 0.7) * 90 + (Math.random() - 0.5) * 25,
    w1:     18  + Math.sin(t * 0.3) * 8  + (Math.random() - 0.5) * 2,
    w2:     55  + Math.sin(t * 0.15) * 28 + (Math.random() - 0.5) * 3,
    uptime: tick * 2,
    rssi:   -62 - Math.random() * 14,
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const riskBadge  = (s: number) => s > 66 ? 'nb-danger' : s > 33 ? 'nb-warn' : 'nb-safe';
const riskLabel  = (s: number) => s > 66 ? 'HIGH'  : s > 33 ? 'MOD'  : 'SAFE';
const tdsBadge   = (v?: number) => !v ? 'nb-safe' : v > 500 ? 'nb-danger' : v > 300 ? 'nb-warn' : 'nb-safe';
const tdsLabel   = (v?: number) => !v ? 'SAFE' : v > 500 ? 'HIGH' : v > 300 ? 'WARN' : 'SAFE';
const floodBadge = (s: number) => s > 66 ? 'nb-danger' : s > 33 ? 'nb-warn' : 'nb-safe';
const floodLabel = (s: number) => s > 66 ? 'HIGH'  : s > 33 ? 'WARN'  : 'SAFE';

const fmtUptime = (s: number) => {
  const h   = Math.floor(s / 3600).toString().padStart(2, '0');
  const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
};

// ─── APP ──────────────────────────────────────────────────────────────────────
type AppState = 'standby' | 'live' | 'demo';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('standby');
  const [fbStatus, setFbStatus] = useState<'connecting' | 'online' | 'error'>('connecting');
  const [page, setPage]         = useState<PageId>('overview');
  const [data, setData]         = useState<LiveData | null>(null);
  const [history, setHistory]   = useState<HistoryData>({ tds: [], w1: [], w2: [] });
  const [uptime, setUptime]     = useState(0);

  const unsubRef  = useRef<(() => void) | null>(null);
  const uptimeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const risks = useMemo(() => data ? computeRisks(data) : EMPTY_RISKS, [data]);

  const pushHistory = useCallback((d: LiveData) => {
    setHistory(prev => ({
      tds: [...prev.tds.slice(-29), d.tds],
      w1:  [...prev.w1.slice(-29),  d.w1 >= 0 ? d.w1 : (prev.w1[prev.w1.length - 1] ?? 20)],
      w2:  [...prev.w2.slice(-29),  d.w2 >= 0 ? d.w2 : (prev.w2[prev.w2.length - 1] ?? 50)],
    }));
  }, []);

  const startUptimeClock = useCallback(() => {
    if (uptimeRef.current) clearInterval(uptimeRef.current);
    setUptime(0);
    uptimeRef.current = setInterval(() => setUptime(p => p + 1), 1000);
  }, []);

  // ─── FIREBASE SUBSCRIPTION ──────────────────────────────────────────────────
  useEffect(() => {
    if (appState === 'demo') return; // demo mode bypasses Firebase

    unsubRef.current = subscribeToNode(
      (incoming) => {
        setFbStatus('online');
        setData(incoming);
        pushHistory(incoming);
        if (appState !== 'live') {
          setAppState('live');
          startUptimeClock();
        }
      },
      () => {
        setFbStatus('error');
      },
    );

    // Mark Firebase as reachable quickly (subscription itself shows connectivity)
    setFbStatus('connecting');
    const reachTimer = setTimeout(() => {
      // If still in standby after 4 s → Firebase connected but node is offline
      setFbStatus(prev => prev === 'connecting' ? 'online' : prev);
    }, 4000);

    return () => {
      clearTimeout(reachTimer);
      unsubRef.current?.();
    };
  }, [appState === 'demo']); // only re-run if demo mode changes

  // ─── DEMO MODE ──────────────────────────────────────────────────────────────
  const startDemo = useCallback(() => {
    unsubRef.current?.();           // detach Firebase listener
    const d = genDemo(0);
    setData(d);
    pushHistory(d);
    setAppState('demo');
    startUptimeClock();
    let tick = 1;
    pollRef.current = setInterval(() => {
      const nd = genDemo(tick++);
      setData(nd);
      pushHistory(nd);
    }, 2000);
  }, [pushHistory, startUptimeClock]);

  useEffect(() => () => {
    unsubRef.current?.();
    if (uptimeRef.current) clearInterval(uptimeRef.current);
    if (pollRef.current)   clearInterval(pollRef.current);
  }, []);

  const navigate = useCallback((p: PageId) => setPage(p), []);

  // ─── STANDBY SCREEN (waiting for first Firebase packet) ─────────────────────
  if (appState === 'standby') {
    return (
      <div id="connect-screen">
        <div className="cs-brand">GEOSENSE<span>PRO</span></div>
        <div className="cs-sub">Water Intelligence Platform · Firebase Stream</div>

        <div className="cs-box">
          {/* Firebase status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: fbStatus === 'error' ? 'var(--red)' : 'var(--green)',
              boxShadow: fbStatus === 'error' ? '0 0 8px var(--red)' : '0 0 8px var(--green)',
              animation: fbStatus === 'connecting' ? 'livepulse 1.2s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mid)' }}>
              {fbStatus === 'connecting' && 'Connecting to Firebase...'}
              {fbStatus === 'online'     && 'Firebase online · Awaiting node transmission...'}
              {fbStatus === 'error'      && 'Firebase unreachable — check .env config'}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', lineHeight: 1.6 }}>
            The ESP32 Water Intelligence Node streams live readings directly to
            Firebase Realtime Database. This dashboard connects automatically — no
            IP configuration required.
          </div>

          {/* Path reference */}
          <div style={{
            background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)',
          }}>
            <span style={{ color: 'var(--green)' }}>RTDB PATH</span>
            &nbsp;→&nbsp;
            <span style={{ color: 'var(--mid)' }}>nodes/water_node</span>
            <br />
            <span style={{ color: 'var(--green)', marginTop: 4, display: 'block' }}>HOST</span>
            &nbsp;→&nbsp;
            <span style={{ color: 'var(--mid)' }}>geosense-pro-ai.web.app</span>
          </div>

          <button className="cs-btn secondary" onClick={startDemo}>
            RUN SIMULATION LAB
          </button>

          {fbStatus === 'error' && (
            <div id="cs-err" style={{ display: 'block' }}>
              Firebase connection failed — verify VITE_FIREBASE_* in .env
            </div>
          )}
        </div>

        <div className="cs-hint">
          Node streams every 5 s · TDS GPIO 35 · HC-SR04 ×2 GPIO 5/18 · 19/23
        </div>
      </div>
    );
  }

  // ─── TICKER ──────────────────────────────────────────────────────────────────
  const tickerItems = [
    { label: 'TDS',        value: data ? `${Math.round(data.tds)} ppm` : '--' },
    { label: 'DRAIN DIST', value: data && data.w1 >= 0 ? `${data.w1.toFixed(1)} cm` : '--' },
    { label: 'TANK DIST',  value: data && data.w2 >= 0 ? `${data.w2.toFixed(1)} cm` : '--' },
    { label: 'FLOOD RISK', value: `${risks.flood} / 100` },
    { label: 'WATER QTY',  value: data?.tds ? (data.tds > 500 ? 'CRITICAL' : data.tds > 300 ? 'WARNING' : 'SAFE') : '--' },
    { label: 'COMPOSITE',  value: `${risks.composite} / 100` },
    { label: 'RSSI',       value: data ? `${Math.round(data.rssi)} dBm` : '--' },
    { label: 'UPTIME',     value: fmtUptime(uptime) },
    { label: 'STREAM',     value: appState === 'demo' ? 'SIM-LAB' : 'FIREBASE·RTDB' },
  ];

  // ─── SIDEBAR NAV ITEM ─────────────────────────────────────────────────────────
  const NavItem = ({
    icon, label, badge, badgeClass, pageId,
  }: { icon: string; label: string; badge: string; badgeClass: string; pageId: PageId }) => (
    <div
      className={`nav-item${page === pageId ? ' active' : ''}`}
      onClick={() => navigate(pageId)}
    >
      <div className="nav-icon">{icon}</div>
      <div className="nav-label">{label}</div>
      <div className={`nav-badge ${badgeClass}`}>{badge}</div>
    </div>
  );

  // ─── MAIN APP ─────────────────────────────────────────────────────────────────
  return (
    <div id="app">
      {/* Demo banner */}
      {appState === 'demo' && (
        <div id="demo-bar" style={{ display: 'block' }}>
          ⚠ SIMULATION LAB ACTIVE — Firebase stream paused. Using heuristic models.
        </div>
      )}

      <div id="body-split">
        {/* ── SIDEBAR ── */}
        <div id="sidebar">
          <div className="brand-area">
            <div className="brand-icon">⬡</div>
            <div className="brand-text">
              <div className="brand-title">GEOSENSE</div>
              <div className="brand-ver">VER 2.0 · WATER NODE</div>
            </div>
          </div>

          <div className="sb-section">Main Module</div>
          <NavItem icon="⬡" label="Dashboard"    badge={appState === 'demo' ? 'DEMO' : 'LIVE'} badgeClass={appState === 'demo' ? 'nb-warn' : 'nb-info'} pageId="overview" />
          <NavItem icon="⚲" label="Risk Radar"   badge={riskLabel(risks.composite)}            badgeClass={riskBadge(risks.composite)}                  pageId="risk" />

          <div className="sb-section" style={{ marginTop: 8 }}>Analysis</div>
          <NavItem icon="∿" label="Heat Stress"  badge="N/A"                        badgeClass="nb-info"             pageId="heat" />
          <NavItem icon="⚑" label="Air Quality"  badge="N/A"                        badgeClass="nb-info"             pageId="air" />
          <NavItem icon="≉" label="Flooding"     badge={floodLabel(risks.flood)}    badgeClass={floodBadge(risks.flood)} pageId="flood" />
          <NavItem icon="⚗" label="TDS Analysis" badge={tdsLabel(data?.tds)}        badgeClass={tdsBadge(data?.tds)} pageId="tds" />
          <NavItem icon="⛫" label="Structural"   badge="N/A"                        badgeClass="nb-info"             pageId="structural" />
          <NavItem icon="☄" label="Wind/Weather" badge="N/A"                        badgeClass="nb-info"             pageId="weather" />
          <NavItem icon="⏚" label="Seismic"      badge="N/A"                        badgeClass="nb-info"             pageId="seismic" />

          <div className="sb-divider" />
          <div className="sb-section">System</div>
          <NavItem icon="✇" label="Location"     badge="N/A"                        badgeClass="nb-info"             pageId="gps" />

          <div className="sys-status-box">
            <div className="ss-inner">
              <div className="ss-lbl">Stream Source</div>
              <div className="ss-val">
                <div className="ss-dot" style={{ background: appState === 'demo' ? 'var(--yellow)' : 'var(--green)', boxShadow: appState === 'demo' ? '0 0 8px var(--yellow)' : '0 0 8px var(--green)' }} />
                <span style={{ fontSize: 9 }}>{appState === 'demo' ? 'SIMULATION LAB' : 'FIREBASE RTDB'}</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', marginTop: 2 }}>
                UP: {fmtUptime(uptime)}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div id="content">
          <div id="main-header">
            <div className="mh-left">
              <div className="mh-back" onClick={() => navigate('overview')}>&lt;</div>
              <div className="mh-title">{PAGE_TITLES[page]}</div>
            </div>
            <div className="mh-right">
              <div className="mh-pill">
                TDS&nbsp;<span style={{ color: data?.tds && data.tds > 300 ? 'var(--yellow)' : 'var(--green)' }}>
                  {data ? `${Math.round(data.tds)}ppm` : '--'}
                </span>
                &nbsp;·&nbsp;W1&nbsp;<span style={{ color: 'var(--blue)' }}>
                  {data && data.w1 >= 0 ? `${data.w1.toFixed(1)}cm` : '--'}
                </span>
                &nbsp;·&nbsp;W2&nbsp;<span style={{ color: 'var(--teal)' }}>
                  {data && data.w2 >= 0 ? `${data.w2.toFixed(1)}cm` : '--'}
                </span>
              </div>
              <div className="mh-avatar">OP</div>
            </div>
          </div>

          <div id="page-container">
            {page === 'overview'   && <DashboardPage   data={data} history={history} risks={risks} onNavigate={navigate} />}
            {page === 'risk'       && <RiskRadarPage   data={data} history={history} risks={risks} onNavigate={navigate} />}
            {page === 'tds'        && <TDSPage         data={data} history={history} risks={risks} />}
            {page === 'flood'      && <FloodPage       data={data} history={history} risks={risks} />}
            {page === 'heat'       && (
              <SensorOfflinePage title="Heat Stress" sensor="DHT22 (Thermal)"
                description="Temperature and humidity monitoring requires the DHT22 sensor. Without it, Heat Index and thermal comfort scores cannot be computed."
                steps={['Connect DHT22 DATA → GPIO 4','VCC → 3.3V, GND → GND','Add 10kΩ pull-up between DATA and VCC','Flash updated firmware with DHT22 enabled']} />
            )}
            {page === 'air'        && (
              <SensorOfflinePage title="Air Quality Matrix" sensor="MQ-135 (Air Quality)"
                description="CO₂, NH₃, Benzene and AQI computation requires the MQ-135 sensor."
                steps={['Connect MQ-135 AOUT → GPIO 34 (analog)','VCC → 5V, GND → GND','Allow 24 h warm-up for accurate readings','Flash updated firmware with MQ-135 enabled']} />
            )}
            {page === 'structural' && (
              <SensorOfflinePage title="Structural Health" sensor="MPU6050 + ADXL345 (Seismic)"
                description="Vibration and tilt monitoring requires IMU sensors on the I2C bus."
                steps={['MPU6050: SDA→GPIO 21, SCL→GPIO 22, addr 0x68','ADXL345: SDA→GPIO 21, SCL→GPIO 22, addr 0x53','Both share I2C bus','Flash updated firmware with seismic module enabled']} />
            )}
            {page === 'weather'    && (
              <SensorOfflinePage title="Weather Systems" sensor="Rain Sensor FC-37 + BH1750"
                description="Rainfall intensity and ambient light require Rain Sensor FC-37 and BH1750."
                steps={['Rain Sensor AOUT → GPIO 34 (analog)','BH1750: SDA→GPIO 21, SCL→GPIO 22','Rain sensor needs outdoor weatherproof enclosure','Flash updated firmware with weather sensors enabled']} />
            )}
            {page === 'seismic'    && (
              <SensorOfflinePage title="Seismic Activity" sensor="MPU6050 + ADXL345 (Seismic)"
                description="Ground motion detection requires MPU6050 and ADXL345 on the I2C bus."
                steps={['MPU6050: SDA→GPIO 21, SCL→GPIO 22, addr 0x68','ADXL345: SDA→GPIO 21, SCL→GPIO 22, addr 0x53','Mount sensors rigidly on structural element','Flash updated firmware with seismic module enabled']} />
            )}
            {page === 'gps'        && (
              <SensorOfflinePage title="Location Data" sensor="NEO-6M GPS (UART)"
                description="Real-time GPS coordinates require the NEO-6M module on UART."
                steps={['NEO-6M TX → GPIO 16 (ESP32 RX2)','NEO-6M RX → GPIO 17 (ESP32 TX2)','VCC → 3.3V, GND → GND','Flash updated firmware with GPS (9600 baud) enabled']} />
            )}
          </div>
        </div>
      </div>

      {/* ── TICKER ── */}
      <div className="ticker-row">
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ti">
              <span>{item.label}</span>{item.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
