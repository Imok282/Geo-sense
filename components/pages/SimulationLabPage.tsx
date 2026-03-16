import React, { useState, useEffect } from 'react';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Sliders,
  Activity,
  TrendingUp,
  TrendingDown,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  Zap,
  Clock,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Layers,
  Target,
  BarChart3
} from 'lucide-react';

interface SimulationLabPageProps {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface SimulationState {
  isPlaying: boolean;
  speed: number;
  timeScale: number;
  currentTime: number;
  scenario: string;
}

const scenarios: Scenario[] = [
  {
    id: 'flood',
    name: 'Flash Flood',
    description: 'Simulate rapid water accumulation from heavy rainfall',
    icon: <Droplets size={24} />,
    color: '#06b6d4'
  },
  {
    id: 'drought',
    name: 'Drought',
    description: 'Extended period without rainfall, water shortage',
    icon: <Thermometer size={24} />,
    color: '#f59e0b'
  },
  {
    id: 'contamination',
    name: 'Contamination',
    description: 'TDS spike from pollutant discharge into water supply',
    icon: <AlertTriangle size={24} />,
    color: '#ef4444'
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    description: 'Seismic event affecting water infrastructure',
    icon: <Activity size={24} />,
    color: '#8b5cf6'
  },
  {
    id: 'snowmelt',
    name: 'Snowmelt Surge',
    description: 'Rapid snowmelt causing water level changes',
    icon: <Wind size={24} />,
    color: '#0ea5e9'
  },
  {
    id: 'leak',
    name: 'Pipeline Leak',
    description: 'Simulated leak in water distribution network',
    icon: <Droplets size={24} />,
    color: '#10b981'
  }
];

const SimulationLabPage: React.FC<SimulationLabPageProps> = ({ data, history, risks }) => {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isPlaying: true,
    speed: 1,
    timeScale: 1,
    currentTime: 0,
    scenario: 'flood'
  });

  const [metrics, setMetrics] = useState({
    tds: 220,
    w1: 18,
    w2: 55,
    floodRisk: 32,
    temperature: 12,
    humidity: 65
  });

  const [selectedScenario, setSelectedScenario] = useState<string>('flood');

  useEffect(() => {
    if (!simulationState.isPlaying) return;

    const interval = setInterval(() => {
      setSimulationState(prev => ({
        ...prev,
        currentTime: prev.currentTime + prev.speed
      }));

      const baseTDS = selectedScenario === 'contamination' ? 350 : 220;
      const baseW1 = selectedScenario === 'flood' ? 5 : selectedScenario === 'drought' ? 28 : 18;
      const baseW2 = selectedScenario === 'flood' ? 95 : selectedScenario === 'drought' ? 15 : 55;

      setMetrics(prev => ({
        tds: baseTDS + Math.sin(simulationState.currentTime * 0.1) * 50 + (Math.random() - 0.5) * 20,
        w1: Math.max(0, baseW1 + Math.sin(simulationState.currentTime * 0.05) * 8),
        w2: Math.max(0, Math.min(100, baseW2 + Math.sin(simulationState.currentTime * 0.03) * 15)),
        floodRisk: selectedScenario === 'flood' 
          ? Math.min(100, 30 + simulationState.currentTime * 0.5)
          : Math.max(0, 30 - simulationState.currentTime * 0.2),
        temperature: 12 + Math.sin(simulationState.currentTime * 0.02) * 5,
        humidity: 65 + Math.sin(simulationState.currentTime * 0.015) * 15
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [simulationState.isPlaying, simulationState.speed, simulationState.currentTime, selectedScenario]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskLevel = (value: number) => {
    if (value < 33) return { label: 'LOW', color: '#10b981' };
    if (value < 66) return { label: 'MEDIUM', color: '#f59e0b' };
    return { label: 'HIGH', color: '#ef4444' };
  };

  const floodRisk = getRiskLevel(metrics.floodRisk);

  return (
    <div className="simulation-page">
      <div className="page-header">
        <div className="header-content">
          <FlaskConical size={28} className="header-icon" />
          <div>
            <h1>Simulation Lab</h1>
            <p>Test scenarios and train AI models with synthetic data</p>
          </div>
        </div>
        <div className="header-status">
          <span className={`status-badge ${simulationState.isPlaying ? 'running' : 'paused'}`}>
            <Activity size={14} />
            {simulationState.isPlaying ? 'SIMULATING' : 'PAUSED'}
          </span>
        </div>
      </div>

      <div className="control-panel">
        <div className="playback-controls">
          <button className="control-btn" onClick={() => setSimulationState(s => ({ ...s, currentTime: 0 }))}>
            <SkipBack size={18} />
          </button>
          <button 
            className="control-btn primary" 
            onClick={() => setSimulationState(s => ({ ...s, isPlaying: !s.isPlaying }))}
          >
            {simulationState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            className="control-btn" 
            onClick={() => setSimulationState(s => ({ ...s, speed: Math.min(5, s.speed + 0.5) }))}
          >
            <FastForward size={18} />
          </button>
          <button 
            className="control-btn" 
            onClick={() => setSimulationState(s => ({ ...s, speed: Math.max(0.5, s.speed - 0.5) }))}
          >
            <Rewind size={18} />
          </button>
        </div>

        <div className="time-display">
          <Clock size={16} />
          <span className="time-value">{formatTime(simulationState.currentTime)}</span>
          <span className="time-label">Elapsed Time</span>
        </div>

        <div className="speed-control">
          <span className="speed-label">Speed</span>
          <div className="speed-buttons">
            {[0.5, 1, 2, 5].map(speed => (
              <button
                key={speed}
                className={`speed-btn ${simulationState.speed === speed ? 'active' : ''}`}
                onClick={() => setSimulationState(s => ({ ...s, speed }))}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="scenario-select">
          <Settings size={16} />
          <select 
            value={selectedScenario}
            onChange={(e) => {
              setSelectedScenario(e.target.value);
              setSimulationState(s => ({ ...s, currentTime: 0, scenario: e.target.value }));
            }}
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="scenario-grid">
        {scenarios.map(scenario => (
          <div 
            key={scenario.id}
            className={`scenario-card ${selectedScenario === scenario.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedScenario(scenario.id);
              setSimulationState(s => ({ ...s, currentTime: 0, scenario: scenario.id }));
            }}
            style={{ '--scenario-color': scenario.color } as React.CSSProperties}
          >
            <div className="scenario-icon" style={{ background: scenario.color }}>
              {scenario.icon}
            </div>
            <div className="scenario-info">
              <h3>{scenario.name}</h3>
              <p>{scenario.description}</p>
            </div>
            {selectedScenario === scenario.id && (
              <div className="scenario-active">
                <Activity size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="metrics-dashboard">
        <div className="metric-panel main">
          <div className="panel-header">
            <Droplets size={20} />
            <span>Water Quality (TDS)</span>
          </div>
          <div className="gauge-container">
            <Gauge 
              value={metrics.tds} 
              min={0} 
              max={600} 
              color={metrics.tds > 500 ? '#ef4444' : metrics.tds > 300 ? '#f59e0b' : '#10b981'}
            />
            <div className="gauge-value">
              <span className="value">{Math.round(metrics.tds)}</span>
              <span className="unit">ppm</span>
            </div>
          </div>
          <div className="metric-range">
            <span>0</span>
            <span className={metrics.tds > 300 ? 'warning' : ''}>300</span>
            <span>500</span>
            <span className={metrics.tds > 500 ? 'danger' : ''}>600+</span>
          </div>
        </div>

        <div className="metric-panel">
          <div className="panel-header">
            <TrendingUp size={18} />
            <span>Flood Risk</span>
          </div>
          <div className="risk-meter">
            <div className="risk-track">
              <div 
                className="risk-fill" 
                style={{ width: `${metrics.floodRisk}%`, background: floodRisk.color }}
              />
            </div>
            <div className="risk-value" style={{ color: floodRisk.color }}>
              {metrics.floodRisk.toFixed(0)}% - {floodRisk.label}
            </div>
          </div>
        </div>

        <div className="metric-panel">
          <div className="panel-header">
            <Droplets size={18} />
            <span>Drain Level</span>
          </div>
          <div className="level-display">
            <div className="level-bar">
              <div 
                className="level-fill water"
                style={{ height: `${Math.min(100, (30 - metrics.w1) / 30 * 100)}%` }}
              />
            </div>
            <span className="level-value">{metrics.w1.toFixed(1)} cm</span>
          </div>
        </div>

        <div className="metric-panel">
          <div className="panel-header">
            <Droplets size={18} />
            <span>Tank Level</span>
          </div>
          <div className="level-display">
            <div className="level-bar">
              <div 
                className="level-fill tank"
                style={{ height: `${Math.min(100, (100 - metrics.w2) / 100 * 100)}%` }}
              />
            </div>
            <span className="level-value">{metrics.w2.toFixed(1)} cm</span>
          </div>
        </div>

        <div className="metric-panel small">
          <div className="panel-header">
            <Thermometer size={16} />
            <span>Temperature</span>
          </div>
          <div className="simple-value">
            <span className="value">{metrics.temperature.toFixed(1)}</span>
            <span className="unit">°C</span>
          </div>
        </div>

        <div className="metric-panel small">
          <div className="panel-header">
            <Wind size={16} />
            <span>Humidity</span>
          </div>
          <div className="simple-value">
            <span className="value">{metrics.humidity.toFixed(0)}</span>
            <span className="unit">%</span>
          </div>
        </div>
      </div>

      <div className="simulation-chart">
        <div className="chart-header">
          <BarChart3 size={20} />
          <h3>Real-time Metrics</h3>
          <div className="chart-legend">
            <span className="legend-item tds"><Droplets size={12} /> TDS</span>
            <span className="legend-item flood"><Activity size={12} /> Flood Risk</span>
          </div>
        </div>
        <div className="chart-area">
          <div className="chart-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid-line" />
            ))}
          </div>
          <svg className="chart-svg" viewBox="0 0 400 150">
            <defs>
              <linearGradient id="tdsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 ${150 - (metrics.tds / 600) * 150} ${Array.from({ length: 20 }, (_, i) => {
                const x = (i + 1) * 20;
                const y = 150 - ((metrics.tds + Math.sin(simulationState.currentTime * 0.1 + i) * 50) / 600) * 150;
                return `L ${x} ${y}`;
              }).join(' ')}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
            />
            <path
              d={`M 0 150 ${Array.from({ length: 21 }, (_, i) => {
                const x = i * 20;
                const y = 150 - ((metrics.floodRisk + Math.sin(simulationState.currentTime * 0.15 + i) * 15) / 100) * 150;
                return `L ${x} ${y}`;
              }).join(' ')} L 400 150`}
              fill="url(#tdsGradient)"
              stroke="none"
            />
            <path
              d={Array.from({ length: 21 }, (_, i) => {
                const x = i * 20;
                const y = 150 - ((metrics.floodRisk + Math.sin(simulationState.currentTime * 0.15 + i) * 15) / 100) * 150;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="data-feed">
        <div className="feed-header">
          <Zap size={16} />
          <span>Live Data Feed</span>
        </div>
        <div className="feed-content">
          <div className="feed-entry">
            <Clock size={12} />
            <span className="feed-time">{formatTime(simulationState.currentTime)}</span>
            <span className="feed-data">TDS: {Math.round(metrics.tds)} ppm</span>
            <span className="feed-status normal">OK</span>
          </div>
          <div className="feed-entry">
            <Clock size={12} />
            <span className="feed-time">{formatTime(simulationState.currentTime - 1)}</span>
            <span className="feed-data">W1: {metrics.w1.toFixed(1)} cm</span>
            <span className="feed-status normal">OK</span>
          </div>
          <div className="feed-entry">
            <Clock size={12} />
            <span className="feed-time">{formatTime(simulationState.currentTime - 2)}</span>
            <span className="feed-data">W2: {metrics.w2.toFixed(1)} cm</span>
            <span className={metrics.floodRisk > 50 ? 'feed-status warning' : 'feed-status normal'}>
              {metrics.floodRisk > 50 ? 'WARN' : 'OK'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .simulation-page {
          padding: 20px;
          height: 100%;
          overflow-y: auto;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          color: #06b6d4;
          padding: 12px;
          background: rgba(6, 182, 212, 0.2);
          border-radius: 14px;
        }

        .header-content h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0;
        }

        .header-content p {
          font-size: 13px;
          color: var(--dim, #888);
          margin: 4px 0 0;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .status-badge.running {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status-badge.paused {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .control-panel {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 16px 24px;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .playback-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--s1, #222);
          border: 1px solid var(--border, #333);
          border-radius: 10px;
          color: var(--fg, #fff);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: var(--s2, #2a2a3e);
        }

        .control-btn.primary {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border: none;
        }

        .control-btn.primary:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4);
        }

        .time-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: var(--s1, #222);
          border-radius: 10px;
          color: var(--dim, #888);
        }

        .time-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--fg, #fff);
          font-family: monospace;
        }

        .time-label {
          font-size: 10px;
          text-transform: uppercase;
        }

        .speed-control {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .speed-label {
          font-size: 10px;
          color: var(--dim, #888);
          text-transform: uppercase;
        }

        .speed-buttons {
          display: flex;
          gap: 4px;
        }

        .speed-btn {
          padding: 6px 12px;
          background: var(--s1, #222);
          border: 1px solid var(--border, #333);
          border-radius: 6px;
          color: var(--mid, #888);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .speed-btn.active {
          background: #06b6d4;
          border-color: #06b6d4;
          color: #fff;
        }

        .scenario-select {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
          color: var(--dim, #888);
        }

        .scenario-select select {
          padding: 10px 16px;
          background: var(--s1, #222);
          border: 1px solid var(--border, #333);
          border-radius: 8px;
          color: var(--fg, #fff);
          font-size: 13px;
          cursor: pointer;
        }

        .scenario-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .scenario-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 16px 12px;
          background: var(--s2, #1a1a2e);
          border: 2px solid transparent;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .scenario-card:hover {
          border-color: var(--scenario-color);
        }

        .scenario-card.selected {
          border-color: var(--scenario-color);
          background: rgba(6, 182, 212, 0.1);
        }

        .scenario-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .scenario-info {
          text-align: center;
        }

        .scenario-info h3 {
          font-size: 12px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0 0 4px;
        }

        .scenario-info p {
          font-size: 9px;
          color: var(--dim, #888);
          margin: 0;
          display: none;
        }

        .scenario-active {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #06b6d4;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .metrics-dashboard {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 0.5fr 0.5fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-panel {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 14px;
          padding: 16px;
        }

        .metric-panel.main {
          grid-row: span 2;
        }

        .metric-panel.small {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--dim, #888);
          margin-bottom: 12px;
        }

        .gauge-container {
          position: relative;
          width: 100%;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gauge-container svg {
          width: 100%;
          height: 100%;
        }

        .gauge-value {
          position: absolute;
          text-align: center;
        }

        .gauge-value .value {
          font-size: 42px;
          font-weight: 700;
          color: var(--fg, #fff);
        }

        .gauge-value .unit {
          font-size: 14px;
          color: var(--dim, #888);
          display: block;
        }

        .metric-range {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--dim, #666);
        }

        .metric-range .warning { color: #f59e0b; }
        .metric-range .danger { color: #ef4444; }

        .risk-meter {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .risk-track {
          height: 12px;
          background: var(--s1, #222);
          border-radius: 6px;
          overflow: hidden;
        }

        .risk-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .risk-value {
          font-size: 14px;
          font-weight: 700;
          text-align: center;
        }

        .level-display {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .level-bar {
          flex: 1;
          height: 80px;
          background: var(--s1, #222);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .level-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          transition: height 0.3s ease;
        }

        .level-fill.water {
          background: linear-gradient(180deg, #06b6d4, #0891b2);
        }

        .level-fill.tank {
          background: linear-gradient(180deg, #10b981, #059669);
        }

        .level-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--fg, #fff);
        }

        .simple-value {
          text-align: center;
        }

        .simple-value .value {
          font-size: 28px;
          font-weight: 700;
          color: var(--fg, #fff);
        }

        .simple-value .unit {
          font-size: 12px;
          color: var(--dim, #888);
        }

        .simulation-chart {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .chart-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0;
          flex: 1;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--dim, #888);
        }

        .legend-item.tds { color: #10b981; }
        .legend-item.flood { color: #f59e0b; }

        .chart-area {
          position: relative;
          height: 150px;
        }

        .chart-grid {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .grid-line {
          height: 1px;
          background: var(--border, #333);
        }

        .chart-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .data-feed {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 12px;
          overflow: hidden;
        }

        .feed-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--s1, #222);
          font-size: 11px;
          font-weight: 600;
          color: var(--dim, #888);
          text-transform: uppercase;
        }

        .feed-header svg {
          color: #06b6d4;
        }

        .feed-content {
          padding: 12px 16px;
        }

        .feed-entry {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border, #333);
        }

        .feed-entry:last-child {
          border-bottom: none;
        }

        .feed-time {
          font-size: 10px;
          color: var(--dim, #666);
          font-family: monospace;
        }

        .feed-data {
          flex: 1;
          font-size: 12px;
          color: var(--fg, #fff);
          font-family: monospace;
        }

        .feed-status {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .feed-status.normal {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .feed-status.warning {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        @media (max-width: 1200px) {
          .scenario-grid { grid-template-columns: repeat(3, 1fr); }
          .metrics-dashboard { grid-template-columns: repeat(3, 1fr); }
          .metric-panel.main { grid-column: span 3; grid-row: span 1; }
        }

        @media (max-width: 768px) {
          .scenario-grid { grid-template-columns: repeat(2, 1fr); }
          .metrics-dashboard { grid-template-columns: repeat(2, 1fr); }
          .metric-panel.main { grid-column: span 2; }
          .control-panel { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

const Gauge = ({ value, min, max, color }: { value: number; min: number; max: number; color: string }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180 - 90;
  
  return (
    <svg viewBox="0 0 100 60" style={{ width: '180px', height: 'auto' }}>
      <path
        d="M 10 55 A 40 40 0 0 1 90 55"
        fill="none"
        stroke="#333"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 10 55 A 40 40 0 0 1 90 55"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${percentage * 1.26} 126`}
      />
    </svg>
  );
};

export default SimulationLabPage;
