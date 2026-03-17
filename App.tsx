
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LiveData, HistoryData, RiskScores, NodeType } from './types';
import { writeNodeData } from './services/firebaseService';
import { connectBLE, isBLESupported } from './services/bleService';
import DashboardPage from './components/pages/DashboardPage';
import RiskRadarPage from './components/pages/RiskRadarPage';
import TDSPage from './components/pages/TDSPage';
import FloodPage from './components/pages/FloodPage';
import SensorOfflinePage from './components/pages/SensorOfflinePage';
import WaterResourcePage from './components/pages/WaterResourcePage';
import VisitorFlowPage from './components/pages/VisitorFlowPage';
import AdvancedFeaturesPage from './components/pages/AdvancedFeaturesPage';
import AIScanPage from './components/pages/AIScanPage';
import SimulationLabPage from './components/pages/SimulationLabPage';
// ─── NEW FEATURE PAGES ────────────────────────────────────────────────────────
import HeatPage from './components/pages/HeatPage';
import AirQualityPage from './components/pages/AirQualityPage';
import StructuralPage from './components/pages/StructuralPage';
import WeatherPage from './components/pages/WeatherPage';
import SeismicPage from './components/pages/SeismicPage';
import AlertCenterPage from './components/pages/AlertCenterPage';
import SettingsPage, { AppSettings, DEFAULT_SETTINGS } from './components/pages/SettingsPage';
import ReportsPage from './components/pages/ReportsPage';
import SystemHealthPage from './components/pages/SystemHealthPage';
// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
import LandingPage from './components/LandingPage';

// ─── PAGE ROUTING ─────────────────────────────────────────────────────────────
export type PageId =
  | 'overview' | 'risk'
  | 'heat' | 'air' | 'flood' | 'tds' | 'structural' | 'weather' | 'seismic' | 'gps'
  | 'water-resources' | 'visitor-flow' | 'advanced'
  | 'ai-scan' | 'simulation'
  | 'alerts' | 'settings' | 'reports' | 'health';

const PAGE_TITLES: Record<PageId, string> = {
  overview:          'DASHBOARD',
  risk:              'RISK RADAR',
  heat:              'HEAT & CLIMATE',
  air:               'AIR QUALITY MATRIX',
  flood:             'HYDRO DYNAMICS',
  tds:               'WATER CONTAMINATION',
  structural:        'STRUCTURAL HEALTH',
  weather:           'WEATHER SYSTEMS',
  seismic:           'SEISMIC ACTIVITY',
  gps:               'SATELLITE LINK',
  'water-resources': 'WATER RESOURCES',
  'visitor-flow':    'VISITOR FLOW',
  'advanced':        'ADVANCED FEATURES',
  'ai-scan':         'AI RISK SCAN',
  'simulation':      'SIMULATION LAB',
  alerts:            'ALERT CENTER',
  settings:          'SETTINGS',
  reports:           'REPORTS & EXPORT',
  health:            'SYSTEM HEALTH',
};

// ─── NODE CONFIGURATION ───────────────────────────────────────────────────────
interface NodeConfig {
  type:        NodeType;
  name:        string;         // long display name on selector card
  short:       string;         // short label in sidebar ver line
  blePrefix:   string;         // BLE device name to scan for
  icon:        string;         // symbol for the selector card
  sensors:     string[];       // human-readable sensor list
  activePages: PageId[];       // pages that have real sensor data on this node
  available:   boolean;        // false = "coming soon" (greyed out)
}

const NODE_CONFIGS: NodeConfig[] = [
  {
    type:        'water',
    name:        'Water Intelligence',
    short:       'WATER NODE',
    blePrefix:   'GEOSENSE-WATER',
    icon:        '≈',
    sensors:     ['TDS Probe (GPIO 35)', 'HC-SR04 Drain (GPIO 5/18)', 'HC-SR04 Tank (GPIO 19/23)'],
    activePages: ['overview', 'risk', 'flood', 'tds'],
    available:   true,
  },
  {
    type:        'air',
    name:        'Air Quality Monitor',
    short:       'AIR NODE',
    blePrefix:   'GEOSENSE-AIR',
    icon:        '⚑',
    sensors:     ['MQ-135 (GPIO 34)', 'DHT22 Temp/Humidity (GPIO 4)'],
    activePages: ['overview', 'risk', 'air', 'heat'],
    available:   false,
  },
  {
    type:        'climate',
    name:        'Climate Monitor',
    short:       'CLIMATE NODE',
    blePrefix:   'GEOSENSE-CLIMATE',
    icon:        '∿',
    sensors:     ['DHT22 (GPIO 4)', 'BMP280 (I2C)', 'BH1750 (I2C)', 'Rain FC-37 (GPIO 34)'],
    activePages: ['overview', 'risk', 'heat', 'weather'],
    available:   false,
  },
  {
    type:        'seismic',
    name:        'Seismic Monitor',
    short:       'SEISMIC NODE',
    blePrefix:   'GEOSENSE-SEISMIC',
    icon:        '⏚',
    sensors:     ['MPU6050 (I2C 0x68)', 'ADXL345 (I2C 0x53)', 'SW-420 (GPIO 34)'],
    activePages: ['overview', 'risk', 'seismic', 'structural'],
    available:   false,
  },
];

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
type AppState = 'landing' | 'standby' | 'live' | 'demo';
type BLEStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'unsupported' | 'error';

const App: React.FC = () => {
  const [appState,      setAppState]      = useState<AppState>('landing');
  const [selectedNode,  setSelectedNode]  = useState<NodeConfig>(NODE_CONFIGS[0]);
  const [bleStatus,     setBleStatus]     = useState<BLEStatus>(isBLESupported() ? 'idle' : 'unsupported');
  const [bleError,      setBleError]      = useState('');
  const [page, setPage]           = useState<PageId>('overview');
  const [data, setData]           = useState<LiveData | null>(null);
  const [history, setHistory]     = useState<HistoryData>({ tds: [], w1: [], w2: [] });
  const [uptime, setUptime]       = useState(0);

  // ─── FEATURE 101-120: New global state ───────────────────────────────────────
  const [settings,       setSettings]       = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readingCount,   setReadingCount]   = useState(0);
  const [demoTick,       setDemoTick]       = useState(0);
  // ─── FEATURE 102: Toast notification system ───────────────────────────────────
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'safe' | 'warn' | 'danger' }[]>([]);
  const toastIdRef = useRef(0);
  // ─── FEATURE 108: Command palette ─────────────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  const bleCleanupRef = useRef<(() => void) | null>(null);
  const uptimeRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  const risks = useMemo(() => data ? computeRisks(data) : EMPTY_RISKS, [data]);

  // ─── FEATURE 102: Push toast ──────────────────────────────────────────────────
  const pushToast = useCallback((msg: string, type: 'safe' | 'warn' | 'danger' = 'warn') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ─── FEATURE 106: Session statistics ──────────────────────────────────────────
  // Count increments are handled in pushHistory below

  const pushHistory = useCallback((d: LiveData) => {
    setHistory(prev => ({
      tds: [...prev.tds.slice(-29), d.tds],
      w1:  [...prev.w1.slice(-29),  d.w1 >= 0 ? d.w1 : (prev.w1[prev.w1.length - 1] ?? 20)],
      w2:  [...prev.w2.slice(-29),  d.w2 >= 0 ? d.w2 : (prev.w2[prev.w2.length - 1] ?? 50)],
    }));
    // ─── FEATURE 106: Increment reading count ─────────────────────────────────
    setReadingCount(c => c + 1);
  }, []);

  const startUptimeClock = useCallback(() => {
    if (uptimeRef.current) clearInterval(uptimeRef.current);
    setUptime(0);
    uptimeRef.current = setInterval(() => setUptime(p => p + 1), 1000);
  }, []);

  // ─── BLE CONNECT ─────────────────────────────────────────────────────────────
  const handleBLEConnect = useCallback(async () => {
    if (!isBLESupported()) return;
    setBleStatus('connecting');
    setBleError('');
    try {
      const cleanup = await connectBLE(
        (incoming) => {
          // Forward to Firebase (fire-and-forget) so other viewers see live data
          writeNodeData(incoming);
          // Update local state immediately (no round-trip wait)
          setData(incoming);
          pushHistory(incoming);
          if (appState !== 'live') {
            setAppState('live');
            startUptimeClock();
          }
        },
        () => {
          // BLE disconnected
          setBleStatus('disconnected');
          setAppState('standby');
          bleCleanupRef.current = null;
        },
        selectedNode.blePrefix,
      );
      bleCleanupRef.current = cleanup;
      setBleStatus('connected');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // User cancelled the browser dialog — treat as idle, not error
      if (msg.toLowerCase().includes('user cancelled') || msg.toLowerCase().includes('chosen')) {
        setBleStatus('idle');
      } else {
        setBleStatus('error');
        setBleError(msg);
      }
    }
  }, [appState, pushHistory, startUptimeClock]);

  // ─── DEMO MODE ──────────────────────────────────────────────────────────────
  const startDemo = useCallback(() => {
    bleCleanupRef.current?.();
    bleCleanupRef.current = null;
    const d = genDemo(0);
    setData(d);
    pushHistory(d);
    setDemoTick(0);
    setAppState('demo');
    startUptimeClock();
    let tick = 1;
    pollRef.current = setInterval(() => {
      const nd = genDemo(tick++);
      setData(nd);
      pushHistory(nd);
      setDemoTick(tick);
    }, 2000);
  }, [pushHistory, startUptimeClock]);

  useEffect(() => () => {
    bleCleanupRef.current?.();
    if (uptimeRef.current) clearInterval(uptimeRef.current);
    if (pollRef.current)   clearInterval(pollRef.current);
  }, []);

  // ─── FEATURE 101: Keyboard shortcuts ──────────────────────────────────────────
  const pageKeys: Record<string, PageId> = {
    '1': 'overview', '2': 'risk',    '3': 'heat',    '4': 'air',
    '5': 'flood',    '6': 'tds',     '7': 'seismic', '8': 'structural',
    '9': 'weather',  '0': 'alerts',  'r': 'reports', 'h': 'health',
    's': 'settings',
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // ─── FEATURE 108: Command palette toggle ────────────────────────────────
      if (e.key === '/') { e.preventDefault(); setCmdOpen(p => !p); return; }
      if (e.key === 'Escape') { setCmdOpen(false); return; }
      const dest = pageKeys[e.key];
      if (dest && appState !== 'standby') setPage(dest);
      // ─── FEATURE 104: Sidebar toggle ────────────────────────────────────────
      if (e.key === 'b') setSidebarCollapsed(p => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [appState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── FEATURE 103: Critical risk toast notifications ───────────────────────────
  const prevCompositeRef = useRef(0);
  useEffect(() => {
    if (!data) return;
    const r = computeRisks(data);
    const prev = prevCompositeRef.current;
    if (r.composite > 66 && prev <= 66) pushToast(`HIGH RISK: Composite score ${r.composite}/100`, 'danger');
    else if (r.tds > 66 && risks.tds <= 66) pushToast(`TDS ALERT: ${Math.round(data.tds)} ppm exceeds WHO limit`, 'danger');
    else if (r.flood > 66 && risks.flood <= 66) pushToast(`FLOOD ALERT: Risk score ${r.flood}/100`, 'warn');
    prevCompositeRef.current = r.composite;
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── FEATURE 110: Active alert count ──────────────────────────────────────────
  const alertCount = useMemo(() => {
    let n = 0;
    if (risks.tds > 33)       n++;
    if (risks.flood > 33)     n++;
    if (risks.drain > 66)     n++;
    if (risks.composite > 33) n++;
    return n;
  }, [risks]);

  const navigate = useCallback((p: PageId) => setPage(p), []);

  // ─── Landing Page Navigation ──────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    setAppState('standby');
  }, []);

  // ─── FEATURE 109: Command palette entries ─────────────────────────────────────
  const allPages: { id: PageId; label: string; hint: string }[] = [
    { id: 'overview',  label: 'Dashboard',        hint: 'Live sensor overview' },
    { id: 'risk',      label: 'Risk Radar',        hint: 'Composite risk scores' },
    { id: 'heat',      label: 'Heat & Climate',    hint: 'Temperature, humidity, heat index' },
    { id: 'air',       label: 'Air Quality',       hint: 'AQI, CO₂, PM2.5, gas trace' },
    { id: 'flood',     label: 'Hydro Dynamics',    hint: 'Flood risk, drain & tank' },
    { id: 'tds',       label: 'TDS Analysis',      hint: 'Water contamination, WHO compliance' },
    { id: 'seismic',   label: 'Seismic Activity',  hint: 'Ground motion, Richter scale' },
    { id: 'structural',label: 'Structural Health', hint: 'Vibration, tilt, integrity score' },
    { id: 'weather',   label: 'Weather Systems',   hint: 'Rainfall, pressure, UV, light' },
    { id: 'gps',       label: 'GPS Location',      hint: 'Satellite fix, coordinates' },
    { id: 'alerts',    label: 'Alert Center',      hint: 'Manage and acknowledge alerts' },
    { id: 'reports',   label: 'Reports & Export',  hint: 'CSV, JSON, compliance audit' },
    { id: 'settings',  label: 'Settings',          hint: 'Units, thresholds, preferences' },
    { id: 'health',    label: 'System Health',     hint: 'Node uptime, sensor matrix' },
  ];
  const cmdResults = cmdQuery
    ? allPages.filter(p => p.label.toLowerCase().includes(cmdQuery.toLowerCase()) || p.hint.toLowerCase().includes(cmdQuery.toLowerCase()))
    : allPages;

  // ─── LANDING SCREEN ──────────────────────────────────────────────────────────
  if (appState === 'landing') {
    return <LandingPage onContinue={handleContinue} />;
  }

  // ─── STANDBY SCREEN — node selector + BLE connect ────────────────────────────
  if (appState === 'standby') {
    const dotColor  = bleStatus === 'connected'    ? 'var(--green)'
                    : bleStatus === 'disconnected' ? 'var(--yellow)'
                    : bleStatus === 'error'        ? 'var(--red)'
                    : 'var(--dim)';
    const statusMsg = bleStatus === 'idle'         ? 'Select a node type below, then click Scan & Connect'
                    : bleStatus === 'connecting'   ? `Scanning for ${selectedNode.blePrefix}...`
                    : bleStatus === 'connected'    ? 'Connected — receiving data'
                    : bleStatus === 'disconnected' ? 'Node disconnected — reconnect below'
                    : bleStatus === 'unsupported'  ? 'Web Bluetooth not supported in this browser'
                    : `Error: ${bleError}`;

    return (
      <div id="connect-screen">
        <div className="cs-brand">GEOSENSE<span>PRO</span></div>
        <div className="cs-sub">AI Climate Intelligence · BLE Bridge</div>

        {/* ── NODE TYPE SELECTOR ── */}
        <div style={{ width: '100%', maxWidth: 480, marginBottom: 18 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)',
            letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase',
          }}>
            Select Node Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {NODE_CONFIGS.map(cfg => {
              const isSelected = selectedNode.type === cfg.type;
              return (
                <div
                  key={cfg.type}
                  onClick={() => { if (cfg.available) { setSelectedNode(cfg); setBleStatus(isBLESupported() ? 'idle' : 'unsupported'); setBleError(''); } }}
                  style={{
                    border: `1px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 9,
                    padding: '10px 12px',
                    background: isSelected ? 'rgba(0,224,160,0.06)' : 'var(--s2)',
                    cursor: cfg.available ? 'pointer' : 'default',
                    opacity: cfg.available ? 1 : 0.4,
                    position: 'relative',
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  {/* available / coming-soon badge */}
                  <div style={{
                    position: 'absolute', top: 7, right: 8,
                    fontFamily: 'var(--mono)', fontSize: 7,
                    background: cfg.available ? (isSelected ? 'var(--green)' : 'rgba(0,224,160,0.15)') : 'rgba(255,255,255,0.06)',
                    color: cfg.available ? (isSelected ? '#000' : 'var(--green)') : 'var(--dim)',
                    padding: '2px 5px', borderRadius: 3,
                  }}>
                    {cfg.available ? (isSelected ? 'SELECTED' : 'ACTIVE') : 'SOON'}
                  </div>

                  <div style={{ fontSize: 20, marginBottom: 4 }}>{cfg.icon}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: isSelected ? 'var(--green)' : 'var(--fg)', marginBottom: 5 }}>
                    {cfg.name}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', lineHeight: 1.6 }}>
                    {cfg.sensors.map(s => <div key={s}>· {s}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cs-box">
          {/* BLE status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: dotColor, boxShadow: `0 0 8px ${dotColor}`,
              animation: bleStatus === 'connecting' ? 'livepulse 1.2s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mid)' }}>
              {statusMsg}
            </span>
          </div>

          {/* Selected node info */}
          <div style={{
            background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 7,
            padding: '9px 12px', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)',
          }}>
            <span style={{ color: 'var(--green)' }}>BLE DEVICE</span>
            &nbsp;→&nbsp;
            <span style={{ color: 'var(--mid)' }}>{selectedNode.blePrefix}</span>
            <br />
            <span style={{ color: 'var(--green)', display: 'block', marginTop: 4 }}>BRIDGE</span>
            &nbsp;→&nbsp;
            <span style={{ color: 'var(--mid)' }}>Browser → Firebase RTDB → Dashboard</span>
            <br />
            <span style={{ color: 'var(--green)', display: 'block', marginTop: 4 }}>BROWSER</span>
            &nbsp;→&nbsp;
            <span style={{ color: 'var(--mid)' }}>Chrome / Edge / Opera required</span>
          </div>

          <button
            className="cs-btn"
            onClick={handleBLEConnect}
            disabled={bleStatus === 'connecting' || bleStatus === 'unsupported' || !selectedNode.available}
            style={{ opacity: (bleStatus === 'unsupported' || !selectedNode.available) ? 0.45 : 1 }}
          >
            {bleStatus === 'connecting' ? 'SCANNING...' : `SCAN & CONNECT — ${selectedNode.short}`}
          </button>

          <button className="cs-btn secondary" onClick={startDemo}>
            RUN SIMULATION LAB
          </button>

          {bleStatus === 'unsupported' && (
            <div id="cs-err" style={{ display: 'block' }}>
              Web Bluetooth not supported. Use Chrome or Edge on desktop/Android.
            </div>
          )}
          {bleStatus === 'error' && (
            <div id="cs-err" style={{ display: 'block' }}>{bleError}</div>
          )}
        </div>

        <div className="cs-hint">
          {selectedNode.short} · {selectedNode.sensors[0]} · BLE every 5 s
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
    { label: 'NODE',       value: appState === 'demo' ? 'SIM-LAB' : appState === 'standby' ? 'SELECT' : selectedNode.short },
    { label: 'STREAM',     value: appState === 'demo' ? 'SIM-LAB' : appState === 'standby' ? 'IDLE' : 'BLE·BRIDGE' },
  ];

  // ─── SIDEBAR NAV ITEM ─────────────────────────────────────────────────────────
  // If the page is not in this node's active pages, always show N/A.
  const isPageActive = (pageId: PageId) =>
    appState === 'demo' || selectedNode.activePages.includes(pageId);

  const NavItem = ({
    icon, label, badge, badgeClass, pageId,
  }: { icon: string; label: string; badge: string; badgeClass: string; pageId: PageId }) => {
    const active = isPageActive(pageId);
    return (
      <div
        className={`nav-item${page === pageId ? ' active' : ''}${!active ? ' nav-item-offline' : ''}`}
        onClick={() => navigate(pageId)}
        style={{ opacity: active ? 1 : 0.5 }}
      >
        <div className="nav-icon">{icon}</div>
        <div className="nav-label">{label}</div>
        <div className={`nav-badge ${active ? badgeClass : 'nb-info'}`}>{active ? badge : 'N/A'}</div>
      </div>
    );
  };

  // ─── MAIN APP ─────────────────────────────────────────────────────────────────
  return (
    <div id="app">
      {/* ─── FEATURE 102: Toast notifications ── */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            fontFamily: 'var(--mono)', fontSize: 10, padding: '9px 14px', borderRadius: 8,
            background: t.type === 'danger' ? 'rgba(255,45,85,0.92)' : t.type === 'warn' ? 'rgba(255,201,64,0.92)' : 'rgba(0,224,160,0.92)',
            color: t.type === 'warn' ? '#000' : t.type === 'safe' ? '#000' : '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxWidth: 340,
            animation: 'pgIn 0.2s ease',
          }}>
            {t.type === 'danger' ? '⚠ ' : t.type === 'warn' ? '⚡ ' : '✓ '}{t.msg}
          </div>
        ))}
      </div>

      {/* ─── FEATURE 108: Command palette ── */}
      {cmdOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9998, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
          onClick={() => setCmdOpen(false)}>
          <div style={{ background: 'var(--s1)', border: '1px solid var(--b2)', borderRadius: 12, width: 480, maxHeight: 420, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
              <input autoFocus value={cmdQuery} onChange={e => setCmdQuery(e.target.value)}
                placeholder="Search pages... (/ to open, Esc to close)"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }} />
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 340 }}>
              {cmdResults.map(p => (
                <div key={p.id} onClick={() => { navigate(p.id); setCmdOpen(false); setCmdQuery(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--s2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)', fontWeight: 600, width: 130, flexShrink: 0 }}>{p.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)' }}>{p.hint}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', display: 'flex', gap: 16 }}>
              <span>↑↓ navigate</span><span>↵ select</span><span>Esc close</span><span>/ toggle</span>
            </div>
          </div>
        </div>
      )}

      {/* Demo banner */}
      {appState === 'demo' && (
        <div id="demo-bar" style={{ display: 'block' }}>
          ⚠ SIMULATION LAB ACTIVE — Firebase stream paused. Using heuristic models. &nbsp;|&nbsp; Press / for command palette &nbsp;|&nbsp; Keys 1–9 navigate pages
        </div>
      )}

      <div id="body-split">
        {/* ─── FEATURE 104: Collapsible sidebar ── */}
        <div id="sidebar" style={{ width: sidebarCollapsed ? 44 : 190, transition: 'width 0.2s ease', overflow: 'hidden' }}>
          {/* ─── FEATURE 104: Collapse toggle button ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', padding: sidebarCollapsed ? '10px 0' : '0 10px' }}>
            {!sidebarCollapsed && (
              <div className="brand-area" style={{ flex: 1 }}>
                <div className="brand-icon">⬡</div>
                <div className="brand-text">
                  <div className="brand-title">GEOSENSE</div>
                  <div className="brand-ver">VER 3.0 · {selectedNode.short}</div>
                </div>
              </div>
            )}
            <div onClick={() => setSidebarCollapsed((p: boolean) => !p)}
              style={{ cursor: 'pointer', padding: '10px 6px', color: 'var(--dim)', fontSize: 12, flexShrink: 0, userSelect: 'none' }}
              title="Toggle sidebar (B)">
              {sidebarCollapsed ? '›' : '‹'}
            </div>
          </div>

          {!sidebarCollapsed && <>
            <div className="sb-section">Main Module</div>
            <NavItem icon="⬡" label="Dashboard"    badge={appState === 'demo' ? 'DEMO' : 'LIVE'} badgeClass={appState === 'demo' ? 'nb-warn' : 'nb-info'} pageId="overview" />
            <NavItem icon="⚲" label="Risk Radar"   badge={riskLabel(risks.composite)}            badgeClass={riskBadge(risks.composite)}                  pageId="risk" />

            <div className="sb-section" style={{ marginTop: 8 }}>Analysis</div>
            <NavItem icon="∿" label="Heat & Climate" badge="LIVE"                        badgeClass="nb-info"                 pageId="heat" />
            <NavItem icon="⚑" label="Air Quality"    badge="LIVE"                        badgeClass="nb-info"                 pageId="air" />
            <NavItem icon="≉" label="Flooding"        badge={floodLabel(risks.flood)}    badgeClass={floodBadge(risks.flood)} pageId="flood" />
            <NavItem icon="⚗" label="TDS Analysis"   badge={tdsLabel(data?.tds)}         badgeClass={tdsBadge(data?.tds)}    pageId="tds" />
            <NavItem icon="⛫" label="Structural"      badge="LIVE"                        badgeClass="nb-info"                 pageId="structural" />
            <NavItem icon="☄" label="Weather"         badge="LIVE"                        badgeClass="nb-info"                 pageId="weather" />
            <NavItem icon="⏚" label="Seismic"         badge="LIVE"                        badgeClass="nb-info"                 pageId="seismic" />

            <div className="sb-section" style={{ marginTop: 8 }}>Services</div>
            <NavItem icon="≈" label="Water Resource"  badge="DEMO" badgeClass="nb-warn" pageId="water-resources" />
            <NavItem icon="⇄" label="Visitor Flow"    badge="DEMO" badgeClass="nb-warn" pageId="visitor-flow" />
            <NavItem icon="⚡" label="Advanced"        badge="NEW"  badgeClass="nb-info" pageId="advanced" />
            <NavItem icon="◉" label="AI Scan"         badge="NEW"  badgeClass="nb-warn" pageId="ai-scan" />
            <NavItem icon="⚗" label="Simulation"     badge="NEW"  badgeClass="nb-info" pageId="simulation" />

            <div className="sb-divider" />
            <div className="sb-section">System</div>
            <NavItem icon="✇" label="Location"        badge="GPS"  badgeClass="nb-info" pageId="gps" />
            {/* ─── FEATURE 110: Alert badge with count ── */}
            <NavItem icon="⚠" label="Alerts"
              badge={alertCount > 0 ? String(alertCount) : 'OK'}
              badgeClass={alertCount > 0 ? (risks.composite > 66 ? 'nb-danger' : 'nb-warn') : 'nb-safe'}
              pageId="alerts" />
            <NavItem icon="↓" label="Reports"         badge="XLS"  badgeClass="nb-info" pageId="reports" />
            <NavItem icon="⛭" label="Settings"        badge="CFG"  badgeClass="nb-info" pageId="settings" />
            <NavItem icon="⬡" label="Sys Health"      badge={appState !== 'standby' ? 'OK' : '--'} badgeClass="nb-safe" pageId="health" />

            <div className="sys-status-box">
              <div className="ss-inner">
                <div className="ss-lbl">Stream</div>
                <div className="ss-val">
                  <div className="ss-dot" style={{ background: appState === 'demo' ? 'var(--yellow)' : 'var(--green)', boxShadow: appState === 'demo' ? '0 0 8px var(--yellow)' : '0 0 8px var(--green)' }} />
                  <span style={{ fontSize: 9 }}>{appState === 'demo' ? 'SIM-LAB' : 'BLE BRIDGE'}</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginTop: 2 }}>UP: {fmtUptime(uptime)}</div>
                {/* ─── FEATURE 107: Signal strength ── */}
                {data && <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>RSSI: {Math.round(data.rssi)} dBm</div>}
                {/* ─── FEATURE 98: Keyboard shortcut hint ── */}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', marginTop: 4, opacity: 0.6 }}>/ = search · B = collapse</div>
              </div>
            </div>
          </>}

          {/* Collapsed icon-only nav */}
          {sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 4 }}>
              {[
                { icon: '⬡', p: 'overview' as PageId }, { icon: '⚲', p: 'risk' as PageId },
                { icon: '∿', p: 'heat' as PageId },     { icon: '⚑', p: 'air' as PageId },
                { icon: '≉', p: 'flood' as PageId },    { icon: '⚗', p: 'tds' as PageId },
                { icon: '⛫', p: 'structural' as PageId },{ icon: '☄', p: 'weather' as PageId },
                { icon: '⏚', p: 'seismic' as PageId },  { icon: '⚠', p: 'alerts' as PageId },
                { icon: '↓', p: 'reports' as PageId },  { icon: '⛭', p: 'settings' as PageId },
              ].map(({ icon, p }) => (
                <div key={p} onClick={() => navigate(p)} title={PAGE_TITLES[p]}
                  style={{ width: 36, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: page === p ? 'var(--green)' : 'var(--dim)', borderLeft: `2px solid ${page === p ? 'var(--green)' : 'transparent'}` }}>
                  {icon}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div id="content">
          <div id="main-header">
            <div className="mh-left">
              <div className="mh-back" onClick={() => navigate('overview')}>&lt;</div>
              <div className="mh-title">{PAGE_TITLES[page]}</div>
            </div>
            <div className="mh-right">
              {/* ─── FEATURE 107: Signal quality pill ── */}
              <div className="mh-pill">
                TDS&nbsp;<span style={{ color: data?.tds && data.tds > 300 ? 'var(--yellow)' : 'var(--green)' }}>
                  {data ? `${Math.round(data.tds)}ppm` : '--'}
                </span>
                &nbsp;·&nbsp;RSSI&nbsp;<span style={{ color: 'var(--blue)' }}>
                  {data ? `${Math.round(data.rssi)}dBm` : '--'}
                </span>
                &nbsp;·&nbsp;<span style={{ color: 'var(--dim)', cursor: 'pointer' }} onClick={() => setCmdOpen(true)} title="Command Palette (/)">/ search</span>
              </div>
              {/* ─── FEATURE 110: Alert count badge in header ── */}
              {alertCount > 0 && (
                <div onClick={() => navigate('alerts')} style={{ cursor: 'pointer', background: risks.composite > 66 ? 'rgba(255,45,85,0.15)' : 'rgba(255,201,64,0.15)', border: `1px solid ${risks.composite > 66 ? 'rgba(255,45,85,0.4)' : 'rgba(255,201,64,0.4)'}`, borderRadius: 6, padding: '3px 10px', fontFamily: 'var(--mono)', fontSize: 9, color: risks.composite > 66 ? 'var(--red)' : 'var(--yellow)', animation: 'bwarn 1.5s step-end infinite' }}>
                  ⚠ {alertCount} alert{alertCount > 1 ? 's' : ''}
                </div>
              )}
              <div className="mh-avatar">OP</div>
            </div>
          </div>

          <div id="page-container">
            {page === 'overview'    && <DashboardPage   data={data} history={history} risks={risks} onNavigate={navigate} />}
            {page === 'risk'        && <RiskRadarPage   data={data} history={history} risks={risks} onNavigate={navigate} />}
            {page === 'tds'         && <TDSPage         data={data} history={history} risks={risks} />}
            {page === 'flood'       && <FloodPage       data={data} history={history} risks={risks} />}
            {/* ─── NEW FULL FEATURE PAGES ── */}
            {page === 'heat'        && <HeatPage        simTick={demoTick} />}
            {page === 'air'         && <AirQualityPage  simTick={demoTick} />}
            {page === 'structural'  && <StructuralPage  simTick={demoTick} />}
            {page === 'weather'     && <WeatherPage     simTick={demoTick} />}
            {page === 'seismic'     && <SeismicPage     simTick={demoTick} />}
            {page === 'alerts'      && <AlertCenterPage data={data} risks={risks} />}
            {page === 'settings'    && <SettingsPage    settings={settings} onSave={setSettings} />}
            {page === 'reports'     && <ReportsPage     data={data} history={history} risks={risks} uptime={uptime} />}
            {page === 'health'      && <SystemHealthPage data={data} risks={risks} uptime={uptime} appState={appState} readingCount={readingCount} />}
            {page === 'gps'         && (
              <SensorOfflinePage title="Location Data" sensor="NEO-6M GPS (UART)"
                description="Real-time GPS coordinates require the NEO-6M module on UART."
                steps={['NEO-6M TX → GPIO 16 (ESP32 RX2)', 'NEO-6M RX → GPIO 17 (ESP32 TX2)', 'VCC → 3.3V, GND → GND', 'Flash updated firmware with GPS (9600 baud) enabled']} />
            )}
            {page === 'water-resources' && <WaterResourcePage data={data} history={history} risks={risks} />}
            {page === 'visitor-flow'    && <VisitorFlowPage   data={data} history={history} risks={risks} />}
            {page === 'advanced'       && <AdvancedFeaturesPage data={data} history={history} risks={risks} />}
            {page === 'ai-scan'       && <AIScanPage         data={data} history={history} risks={risks} />}
            {page === 'simulation'     && <SimulationLabPage  data={data} history={history} risks={risks} />}
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
