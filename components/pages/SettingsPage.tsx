
import React, { useState } from 'react';

export interface AppSettings {
  units: 'metric' | 'imperial';
  tdsThreshold: number;
  floodThreshold: number;
  chartPoints: 30 | 60 | 90;
  demoSpeed: 'slow' | 'normal' | 'fast';
  autoReconnect: boolean;
  soundAlerts: boolean;
  accentColor: 'green' | 'blue' | 'purple' | 'orange';
  sidebarCollapsed: boolean;
  showToasts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  units:           'metric',
  tdsThreshold:    300,
  floodThreshold:  50,
  chartPoints:     30,
  demoSpeed:       'normal',
  autoReconnect:   true,
  soundAlerts:     false,
  accentColor:     'green',
  sidebarCollapsed: false,
  showToasts:      true,
};

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
}

const C = { green: '#00e0a0', blue: '#2dc8f0', yellow: '#ffc940', red: '#ff2d55', orange: '#ff6820', purple: '#a855f7', teal: '#14b8a6', dim: '#182430', s2: '#0d1419' };

const accentMap: Record<AppSettings['accentColor'], string> = { green: C.green, blue: C.blue, purple: C.purple, orange: C.orange };

// ─── Reusable toggle switch ────────────────────────────────────────────────────
const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mid)' }}>{label}</span>
    <div onClick={() => onChange(!value)} style={{
      width: 36, height: 20, borderRadius: 10, background: value ? C.green : 'var(--border)',
      cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 19 : 3, width: 14, height: 14,
        borderRadius: '50%', background: value ? '#000' : 'var(--mid)',
        transition: 'left 0.2s',
      }} />
    </div>
  </div>
);

const SettingsPage: React.FC<Props> = ({ settings, onSave }) => {
  const [local, setLocal] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title }: { title: string }) => (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 2, textTransform: 'uppercase', padding: '16px 0 6px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
      {title}
    </div>
  );

  const accent = accentMap[local.accentColor];

  return (
    <div className="page">
      <div className="g2">
        {/* Left column */}
        <div>
          {/* ─── FEATURE 71: Units system ── */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-h"><div className="card-title">Measurement Units</div></div>
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['metric', 'imperial'] as const).map(u => (
                  <div key={u} onClick={() => update('units', u)} style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    background: local.units === u ? accent + '20' : 'var(--s2)',
                    border: `1px solid ${local.units === u ? accent + '50' : 'var(--border)'}`,
                    fontFamily: 'var(--mono)', fontSize: 10, color: local.units === u ? accent : 'var(--dim)',
                    transition: 'all 0.15s',
                  }}>
                    {u === 'metric' ? '°C / cm / ppm' : '°F / in / ppm'}
                    <div style={{ fontSize: 8, marginTop: 4, color: 'var(--dim)' }}>{u.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── FEATURE 78: Accent color ── */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-h"><div className="card-title">Accent Color</div></div>
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {(Object.entries(accentMap) as [AppSettings['accentColor'], string][]).map(([key, col]) => (
                  <div key={key} onClick={() => update('accentColor', key)} style={{
                    width: 36, height: 36, borderRadius: 8, background: col + '20', cursor: 'pointer',
                    border: `2px solid ${local.accentColor === key ? col : col + '30'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: local.accentColor === key ? `0 0 8px ${col}50` : 'none',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: col }} />
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', marginTop: 8 }}>
                Selected: <span style={{ color: accent, textTransform: 'uppercase' }}>{local.accentColor}</span>
              </div>
            </div>
          </div>

          {/* ─── FEATURE 74: Chart points ── */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-h"><div className="card-title">Chart Window</div></div>
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {([30, 60, 90] as const).map(n => (
                  <div key={n} onClick={() => update('chartPoints', n)} style={{
                    flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                    background: local.chartPoints === n ? accent + '20' : 'var(--s2)',
                    border: `1px solid ${local.chartPoints === n ? accent + '50' : 'var(--border)'}`,
                    fontFamily: 'var(--mono)', fontSize: 11, color: local.chartPoints === n ? accent : 'var(--dim)',
                  }}>
                    {n}
                    <div style={{ fontSize: 8, color: 'var(--dim)', marginTop: 2 }}>points</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── FEATURE 75: Demo speed ── */}
          <div className="card">
            <div className="card-h"><div className="card-title">Simulation Speed</div></div>
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['slow', 'normal', 'fast'] as const).map(s => (
                  <div key={s} onClick={() => update('demoSpeed', s)} style={{
                    flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer', textAlign: 'center',
                    background: local.demoSpeed === s ? accent + '20' : 'var(--s2)',
                    border: `1px solid ${local.demoSpeed === s ? accent + '50' : 'var(--border)'}`,
                    fontFamily: 'var(--mono)', fontSize: 9, color: local.demoSpeed === s ? accent : 'var(--dim)',
                    textTransform: 'uppercase',
                  }}>
                    {s}
                    <div style={{ fontSize: 7, color: 'var(--dim)', marginTop: 2 }}>
                      {s === 'slow' ? '5s' : s === 'normal' ? '2s' : '0.5s'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* ─── FEATURE 72/73: Alert thresholds ── */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-h"><div className="card-title">Alert Thresholds</div></div>
            <div style={{ padding: '14px' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', letterSpacing: 1 }}>TDS WARNING THRESHOLD</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: accent, fontWeight: 700 }}>{local.tdsThreshold} ppm</span>
                </div>
                <input type="range" min={50} max={800} step={10} value={local.tdsThreshold}
                  onChange={e => update('tdsThreshold', Number(e.target.value))}
                  style={{ width: '100%', accentColor: accent }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--dim)', marginTop: 2 }}>
                  <span>50 ppm</span><span>WHO 500 ppm</span><span>800 ppm</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--dim)', letterSpacing: 1 }}>FLOOD RISK THRESHOLD</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: accent, fontWeight: 700 }}>{local.floodThreshold}/100</span>
                </div>
                <input type="range" min={10} max={95} step={5} value={local.floodThreshold}
                  onChange={e => update('floodThreshold', Number(e.target.value))}
                  style={{ width: '100%', accentColor: accent }} />
              </div>
            </div>
          </div>

          {/* ─── FEATURE 76/77/80: Toggles ── */}
          <div className="card">
            <div className="card-h"><div className="card-title">System Preferences</div></div>
            <div style={{ padding: '2px 14px 8px' }}>
              <Toggle value={local.autoReconnect} onChange={v => update('autoReconnect', v)} label="Auto-Reconnect BLE on Disconnect" />
              <Toggle value={local.soundAlerts}   onChange={v => update('soundAlerts', v)}   label="Sound Notifications for Alerts" />
              <Toggle value={local.showToasts}    onChange={v => update('showToasts', v)}    label="Toast Notifications" />
              <Toggle value={local.sidebarCollapsed} onChange={v => update('sidebarCollapsed', v)} label="Collapse Sidebar by Default" />

              <div style={{ padding: '14px 0 0' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)', letterSpacing: 2, marginBottom: 8 }}>FIRMWARE / BUILD</div>
                {[
                  ['Version',     'GeoSense Pro v3.0'],
                  ['Build',       '2026.03'],
                  ['Firmware',    'ESP32 BLE v1.4'],
                  ['Protocol',    'BLE 5.0 · GATT NOTIFY'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--dim)' }}>{k}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--mid)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <button onClick={handleSave} style={{
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: 2,
          padding: '12px 28px', border: 'none', borderRadius: 8, cursor: 'pointer',
          background: saved ? C.green : accent, color: '#000', transition: 'background 0.3s',
        }}>
          {saved ? '✓ SAVED' : 'SAVE SETTINGS'}
        </button>
        <button onClick={() => setLocal(DEFAULT_SETTINGS)} style={{
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1, padding: '12px 20px',
          border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
          background: 'var(--s2)', color: 'var(--dim)',
        }}>RESTORE DEFAULTS</button>
      </div>
    </div>
  );
};

export default SettingsPage;
