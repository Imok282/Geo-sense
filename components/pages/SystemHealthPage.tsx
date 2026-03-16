
import React, { useState, useEffect } from 'react';
import { LiveData, RiskScores } from '../../types';

interface Props {
  data:      LiveData | null;
  risks:     RiskScores;
  uptime:    number;
  appState:  'standby' | 'live' | 'demo';
  readingCount: number;
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', teal: '#14b8a6', purple: '#a855f7', dim: '#182430', s2: '#0d1419' };

const fmtUptime = (s: number) => `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

// ─── FEATURE 93: BLE signal quality ───────────────────────────────────────────
function rssiQuality(rssi: number): { label: string; color: string; bars: number } {
  if (rssi > -50)  return { label: 'EXCELLENT', color: C.green,  bars: 5 };
  if (rssi > -65)  return { label: 'GOOD',      color: C.teal,   bars: 4 };
  if (rssi > -75)  return { label: 'FAIR',      color: C.yellow, bars: 3 };
  if (rssi > -85)  return { label: 'WEAK',      color: C.orange, bars: 2 };
  return           { label: 'POOR',      color: C.red,    bars: 1 };
}

// ─── FEATURE 100: Hardware diagnostics ────────────────────────────────────────
const SENSORS = [
  { name: 'TDS Probe',      gpio: 'GPIO 35', protocol: 'Analog ADC',  checkFn: (d: LiveData | null) => d !== null && d.tds >= 0 },
  { name: 'HC-SR04 #1',     gpio: 'GPIO 5/18', protocol: 'Ultrasonic', checkFn: (d: LiveData | null) => d !== null && d.w1 >= 0 },
  { name: 'HC-SR04 #2',     gpio: 'GPIO 19/23', protocol: 'Ultrasonic', checkFn: (d: LiveData | null) => d !== null && d.w2 >= 0 },
  { name: 'WiFi Module',    gpio: 'Built-in', protocol: '802.11 b/g/n', checkFn: (d: LiveData | null) => d !== null && d.rssi < 0 },
  { name: 'BLE Module',     gpio: 'Built-in', protocol: 'BLE 5.0',     checkFn: (d: LiveData | null) => d !== null },
  { name: 'DHT22',          gpio: 'GPIO 4',   protocol: '1-Wire',      checkFn: (_: LiveData | null) => false },
  { name: 'MQ-135',         gpio: 'GPIO 34',  protocol: 'Analog ADC',  checkFn: (_: LiveData | null) => false },
  { name: 'MPU6050',        gpio: 'I2C 0x68', protocol: 'I²C',         checkFn: (_: LiveData | null) => false },
  { name: 'ADXL345',        gpio: 'I2C 0x53', protocol: 'I²C',         checkFn: (_: LiveData | null) => false },
  { name: 'NEO-6M GPS',     gpio: 'UART2',    protocol: 'NMEA 9600bd', checkFn: (_: LiveData | null) => false },
];

// ─── FEATURE 95: Event log ─────────────────────────────────────────────────────
const INITIAL_EVENTS = [
  { time: 'Boot',       type: 'SYSTEM', msg: 'GeoSense Pro v3.0 initialized' },
  { time: '00:00:01',   type: 'BLE',    msg: 'BLE service started (GATT NOTIFY)' },
  { time: '00:00:02',   type: 'SENSOR', msg: 'TDS probe calibration loaded (K=1.0)' },
  { time: '00:00:03',   type: 'SENSOR', msg: 'HC-SR04 ×2 initialization complete' },
  { time: '00:00:05',   type: 'CLOUD',  msg: 'Firebase RTDB connection established' },
];

const SystemHealthPage: React.FC<Props> = ({ data, risks, uptime, appState, readingCount }) => {
  const [events] = useState(INITIAL_EVENTS);
  const [now, setNow] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // ─── FEATURE 93: Signal quality ──
  const sigQ  = data ? rssiQuality(data.rssi) : { label: 'NO DATA', color: C.dim, bars: 0 };
  const sensorStatuses = SENSORS.map(s => ({ ...s, online: s.checkFn(data) }));
  const onlineCount  = sensorStatuses.filter(s => s.online).length;
  const offlineCount = sensorStatuses.filter(s => !s.online).length;

  // ─── FEATURE 91: Uptime gauge ─────────────────────────────────────────────────
  const uptimePct = Math.min(100, Math.round((uptime / (24 * 3600)) * 100));
  // ─── FEATURE 94: Packet counter ───────────────────────────────────────────────
  const packetsPerMin = appState === 'demo' ? 30 : 12;

  return (
    <div className="page">
      {/* ── Row 1: 4 health metrics ── */}
      <div className="g4">
        {/* ─── FEATURE 91: Node uptime ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Node Uptime</div>
            <span className="badge badge-safe">ONLINE</span>
          </div>
          <div style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 800, color: C.green, letterSpacing: 2 }}>{fmtUptime(uptime)}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', margin: '6px 0 8px', letterSpacing: 1 }}>HH:MM:SS</div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${uptimePct}%`, background: C.green, borderRadius: 2, transition: 'width 1s' }} />
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginTop: 4 }}>{uptimePct}% of 24h target</div>
          </div>
        </div>

        {/* ─── FEATURE 93: BLE signal ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Signal Quality</div>
            <span className="badge" style={{ color: sigQ.color, background: `${sigQ.color}15` }}>{sigQ.label}</span>
          </div>
          <div style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 800, color: sigQ.color }}>
              {data ? `${Math.round(data.rssi)}` : '--'}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', margin: '4px 0 10px' }}>dBm RSSI</div>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(b => (
                <div key={b} style={{ width: 8, height: b * 6, borderRadius: 2, background: b <= sigQ.bars ? sigQ.color : 'var(--border)', alignSelf: 'flex-end' }} />
              ))}
            </div>
          </div>
        </div>

        {/* ─── FEATURE 94: Packet counter ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Data Packets</div>
            <span className={`badge ${appState === 'live' ? 'badge-safe' : appState === 'demo' ? 'badge-warn' : 'badge-info'}`}>{appState.toUpperCase()}</span>
          </div>
          <div style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 800, color: C.blue }}>{readingCount}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', margin: '4px 0 6px' }}>TOTAL READINGS</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--mid)' }}>{packetsPerMin} pkts/min · {appState === 'live' ? '5s BLE interval' : appState === 'demo' ? '2s sim interval' : 'standby'}</div>
          </div>
        </div>

        {/* ─── FEATURE 92: Firebase status ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Cloud Status</div>
          </div>
          <div style={{ padding: '14px' }}>
            {[
              { svc: 'Firebase RTDB', status: appState === 'live',  detail: 'nodes/water_node' },
              { svc: 'BLE Bridge',    status: appState === 'live',  detail: 'GATT NOTIFY 5s' },
              { svc: 'Gemini AI',     status: false,                detail: 'API available' },
              { svc: 'GPS Fix',       status: false,                detail: 'NEO-6M offline' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.status ? C.green : C.dim, boxShadow: s.status ? `0 0 6px ${C.green}` : 'none', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--mid)', flex: 1 }}>{s.svc}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)' }}>{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Sensor matrix + Event log ── */}
      <div className="g2 mt">
        {/* ─── FEATURE 96: Sensor status matrix ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Sensor Status Matrix</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="badge badge-safe">{onlineCount} ONLINE</span>
              <span className="badge" style={{ color: offlineCount > 0 ? C.dim : C.green, background: 'var(--s2)' }}>{offlineCount} OFFLINE</span>
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {sensorStatuses.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px', borderBottom: i < sensorStatuses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.online ? C.green : C.dim, boxShadow: s.online ? `0 0 6px ${C.green}` : 'none', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: s.online ? 'var(--mid)' : 'var(--dim)', flex: 1 }}>{s.name}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', width: 70, textAlign: 'right' }}>{s.gpio}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 7, color: s.online ? C.green : 'var(--dim)', width: 60, textAlign: 'right' }}>{s.online ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FEATURE 95: Event log ── */}
        <div className="card">
          <div className="card-h">
            <div className="card-title">Connection Event Log</div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>{now}</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {[...events].reverse().map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 14px', borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', width: 55, flexShrink: 0 }}>{ev.time}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 7, padding: '1px 5px', borderRadius: 3, background: ev.type === 'SYSTEM' ? C.blue + '20' : ev.type === 'BLE' ? C.green + '20' : ev.type === 'CLOUD' ? C.purple + '20' : C.yellow + '20', color: ev.type === 'SYSTEM' ? C.blue : ev.type === 'BLE' ? C.green : ev.type === 'CLOUD' ? C.purple : C.yellow, flexShrink: 0 }}>{ev.type}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--mid)', lineHeight: 1.5 }}>{ev.msg}</span>
              </div>
            ))}
          </div>

          {/* ─── FEATURE 99: System info ── */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              ['App Version', 'GeoSense Pro v3.0'],
              ['Build Date',  '2026-03'],
              ['Node Type',   appState === 'demo' ? 'SIM-LAB' : 'WATER-NODE'],
              ['Protocol',    'BLE 5.0 · GATT'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)' }}>{k}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--mid)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPage;
