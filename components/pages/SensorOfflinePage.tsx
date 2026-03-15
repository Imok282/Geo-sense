
import React from 'react';

interface Props {
  title: string;
  sensor: string;
  description: string;
  steps?: string[];
}

const SensorOfflinePage: React.FC<Props> = ({ title, sensor, description, steps }) => (
  <div className="page">
    <div className="offline-wrap">
      <div className="offline-icon">⊘</div>
      <div className="offline-title">{title.toUpperCase()}</div>
      <div className="offline-sensor">{sensor}</div>
      <div className="offline-desc">{description}</div>

      {steps && steps.length > 0 && (
        <div className="offline-steps">
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 4 }}>
            Wiring Guide
          </div>
          {steps.map((step, i) => (
            <div key={i} className="offline-step">
              <span className="offline-step-num">{(i + 1).toString().padStart(2, '0')}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '14px 18px', maxWidth: 380, width: '100%',
        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)', lineHeight: 1.6,
        textAlign: 'left',
      }}>
        <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
          ACTIVE ON THIS NODE
        </div>
        <div style={{ color: 'var(--mid)' }}>
          ✓ TDS Sensor — GPIO 35 (Analog)<br />
          ✓ HC-SR04 #1 (Drain) — TRIG GPIO 5 / ECHO GPIO 18<br />
          ✓ HC-SR04 #2 (Tank) — TRIG GPIO 19 / ECHO GPIO 23
        </div>
      </div>
    </div>
  </div>
);

export default SensorOfflinePage;
