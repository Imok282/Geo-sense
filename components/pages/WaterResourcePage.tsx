import React from 'react';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { Droplets, AlertTriangle, TrendingUp, Activity, Thermometer, MapPin, Clock, CheckCircle } from 'lucide-react';

interface WaterResourcePageProps {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
}

const WaterResourcePage: React.FC<WaterResourcePageProps> = ({ data, history, risks }) => {
  const waterQuality = data?.tds ? (data.tds > 500 ? 'CRITICAL' : data.tds > 300 ? 'WARNING' : 'SAFE') : 'UNKNOWN';
  const tankLevel = data?.w2 ? Math.round((1 - data.w2 / 100) * 100) : 0;
  const drainDistance = data?.w1 ?? 0;
  
  const leakRisk = drainDistance < 5 ? 'HIGH' : drainDistance < 10 ? 'MODERATE' : 'LOW';
  const floodRisk = tankLevel > 80 ? 'HIGH' : tankLevel > 60 ? 'MODERATE' : 'LOW';

  return (
    <div className="water-resource-page">
      <div className="page-grid">
        {/* Header Stats */}
        <div className="stat-card header-stat">
          <div className="stat-icon water">
            <Droplets size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Water Resource Monitoring</div>
            <div className="stat-value">ALPINE INTELLIGENCE</div>
            <div className="stat-sub">Real-time watershed management</div>
          </div>
        </div>

        {/* Water Quality Status */}
        <div className="stat-card quality-card">
          <div className="card-header">
            <Droplets size={20} />
            <span>Water Quality (TDS)</span>
            <span className={`status-badge ${waterQuality.toLowerCase()}`}>{waterQuality}</span>
          </div>
          <div className="metric-large">
            <span className="metric-value">{data?.tds ? Math.round(data.tds) : '--'}</span>
            <span className="metric-unit">ppm</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${data?.tds ? Math.min(100, (data.tds / 600) * 100) : 0}%`,
                background: data?.tds && data.tds > 500 ? 'var(--red)' : data?.tds && data.tds > 300 ? 'var(--yellow)' : 'var(--green)'
              }}
            />
          </div>
          <div className="metric-labels">
            <span>0</span>
            <span>300</span>
            <span>500</span>
            <span>600+</span>
          </div>
        </div>

        {/* Tank Level */}
        <div className="stat-card tank-card">
          <div className="card-header">
            <Activity size={20} />
            <span>Storage Tank Level</span>
          </div>
          <div className="tank-visual">
            <div className="tank-container">
              <div className="tank-fill" style={{ height: `${tankLevel}%` }}>
                <span className="tank-percent">{tankLevel}%</span>
              </div>
            </div>
            <div className="tank-labels">
              <span>Full</span>
              <span>Empty</span>
            </div>
          </div>
          <div className="tank-status">
            <span className={`risk-indicator ${floodRisk.toLowerCase()}`}>
              <AlertTriangle size={14} />
              Flood Risk: {floodRisk}
            </span>
          </div>
        </div>

        {/* Drain Monitoring */}
        <div className="stat-card drain-card">
          <div className="card-header">
            <TrendingUp size={20} />
            <span>Drain Sensor</span>
          </div>
          <div className="drain-info">
            <div className="drain-value">
              <span className="value">{data?.w1 ? data.w1.toFixed(1) : '--'}</span>
              <span className="unit">cm</span>
            </div>
            <div className="drain-distance">Distance to water</div>
          </div>
          <div className="leak-alert">
            <span className={`alert-badge ${leakRisk.toLowerCase()}`}>
              <AlertTriangle size={14} />
              Leak Risk: {leakRisk}
            </span>
          </div>
        </div>

        {/* Service Cards */}
        <div className="service-card">
          <div className="service-icon">
            <Droplets size={28} />
          </div>
          <h3>Drinking Water Supply</h3>
          <p>Seamless monitoring of sources, reservoirs, and distribution networks to detect water losses early.</p>
          <ul className="feature-list">
            <li><CheckCircle size={14} /> Spring discharge monitoring</li>
            <li><CheckCircle size={14} /> Water quality analysis</li>
            <li><CheckCircle size={14} /> Pipeline leak detection</li>
            <li><CheckCircle size={14} /> Live data transmission</li>
          </ul>
        </div>

        <div className="service-card">
          <div className="service-icon warning">
            <AlertTriangle size={28} />
          </div>
          <h3>Flood & Early Warning</h3>
          <p>AI-based analysis identifies critical flood or mudslide risks and automatically triggers alerts.</p>
          <ul className="feature-list">
            <li><CheckCircle size={14} /> Radar water level sensors</li>
            <li><CheckCircle size={14} /> Flow speed detection</li>
            <li><CheckCircle size={14} /> GIS risk visualization</li>
            <li><CheckCircle size={14} /> Automated emergency alerts</li>
          </ul>
        </div>

        <div className="service-card">
          <div className="service-icon info">
            <Thermometer size={28} />
          </div>
          <h3>Ski Resort Management</h3>
          <p>Monitoring snowmelt and water reservoirs to optimize water availability for artificial snow production.</p>
          <ul className="feature-list">
            <li><CheckCircle size={14} /> Snowmelt tracking</li>
            <li><CheckCircle size={14} /> Reservoir management</li>
            <li><CheckCircle size={14} /> Artificial snow optimization</li>
            <li><CheckCircle size={14} /> Agricultural irrigation</li>
          </ul>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="mini-stat">
            <Clock size={16} />
            <span>Last Update</span>
            <strong>Live</strong>
          </div>
          <div className="mini-stat">
            <MapPin size={16} />
            <span>Alpine Region</span>
            <strong>Active</strong>
          </div>
          <div className="mini-stat">
            <Activity size={16} />
            <span>Network Status</span>
            <strong>Connected</strong>
          </div>
        </div>
      </div>

      <style>{`
        .water-resource-page {
          padding: 20px;
          height: 100%;
          overflow-y: auto;
        }
        
        .page-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .stat-card {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 20px;
        }
        
        .header-stat {
          grid-column: span 12;
          display: flex;
          align-items: center;
          gap: 20px;
          background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
          border-color: #1e5f8a;
        }
        
        .stat-icon.water {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          padding: 16px;
          border-radius: 16px;
          color: #fff;
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--dim, #888);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 4px 0;
        }
        
        .stat-sub {
          font-size: 11px;
          color: var(--mid, #aaa);
        }
        
        .quality-card {
          grid-column: span 4;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          font-weight: 600;
        }
        
        .status-badge {
          margin-left: auto;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .status-badge.safe { background: #10b981; color: #000; }
        .status-badge.warning { background: #f59e0b; color: #000; }
        .status-badge.critical { background: #ef4444; color: #fff; }
        
        .metric-large {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .metric-value {
          font-size: 48px;
          font-weight: 700;
          color: var(--fg, #fff);
        }
        
        .metric-unit {
          font-size: 18px;
          color: var(--dim, #888);
        }
        
        .progress-bar {
          height: 8px;
          background: var(--s1, #222);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .metric-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 9px;
          color: var(--dim, #666);
        }
        
        .tank-card {
          grid-column: span 4;
        }
        
        .tank-visual {
          display: flex;
          gap: 16px;
          margin: 20px 0;
        }
        
        .tank-container {
          width: 60px;
          height: 120px;
          border: 3px solid var(--border, #444);
          border-radius: 8px 8px 20px 20px;
          position: relative;
          overflow: hidden;
          background: var(--s1, #222);
        }
        
        .tank-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, #00d4ff, #0066cc);
          transition: height 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tank-percent {
          font-size: 12px;
          font-weight: 700;
          color: #000;
        }
        
        .tank-labels {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 10px;
          color: var(--dim, #888);
        }
        
        .tank-status {
          margin-top: 16px;
        }
        
        .risk-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .risk-indicator.high { color: #ef4444; }
        .risk-indicator.moderate { color: #f59e0b; }
        .risk-indicator.low { color: #10b981; }
        
        .drain-card {
          grid-column: span 4;
        }
        
        .drain-info {
          text-align: center;
          padding: 20px 0;
        }
        
        .drain-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
        }
        
        .drain-value .value {
          font-size: 42px;
          font-weight: 700;
          color: var(--fg, #fff);
        }
        
        .drain-value .unit {
          font-size: 16px;
          color: var(--dim, #888);
        }
        
        .drain-distance {
          font-size: 11px;
          color: var(--dim, #888);
          margin-top: 8px;
        }
        
        .leak-alert {
          margin-top: 16px;
        }
        
        .alert-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
        }
        
        .alert-badge.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .alert-badge.moderate { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .alert-badge.low { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        
        .service-card {
          grid-column: span 4;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        
        .service-card:hover {
          transform: translateY(-4px);
          border-color: #00d4ff;
        }
        
        .service-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #00d4ff, #0066cc);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 16px;
        }
        
        .service-icon.warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .service-icon.info {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        }
        
        .service-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin-bottom: 8px;
        }
        
        .service-card p {
          font-size: 12px;
          color: var(--mid, #aaa);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .feature-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--dim, #888);
          margin-bottom: 8px;
        }
        
        .feature-list li svg {
          color: #10b981;
        }
        
        .stats-row {
          grid-column: span 12;
          display: flex;
          gap: 16px;
          justify-content: center;
          padding: 20px;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
        }
        
        .mini-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--dim, #888);
        }
        
        .mini-stat strong {
          color: var(--fg, #fff);
        }
        
        @media (max-width: 1024px) {
          .quality-card, .tank-card, .drain-card, .service-card {
            grid-column: span 6;
          }
        }
        
        @media (max-width: 640px) {
          .quality-card, .tank-card, .drain-card, .service-card {
            grid-column: span 12;
          }
          
          .stats-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default WaterResourcePage;
