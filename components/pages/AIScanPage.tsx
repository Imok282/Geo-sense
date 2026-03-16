import React, { useState } from 'react';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { 
  Brain, 
  Scan, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Activity,
  Target,
  Shield,
  FileText,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';

interface AIScanPageProps {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
}

interface ScanResult {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  confidence: number;
}

const AIScanPage: React.FC<AIScanPageProps> = ({ data, history, risks }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string | null>('14:32:05');
  const [results, setResults] = useState<ScanResult[]>([
    {
      id: '1',
      title: 'Water Quality Anomaly',
      description: 'TDS levels showed 23% increase over 30-minute period. Possible contamination event detected.',
      severity: 'high',
      recommendation: 'Run secondary TDS sensor verification. Check for nearby industrial discharge.',
      confidence: 94
    },
    {
      id: '2',
      title: 'Flood Risk Escalation',
      description: 'Drain sensor readings indicate rapid water accumulation. Combined with precipitation forecast, risk elevated.',
      severity: 'medium',
      recommendation: 'Monitor drain levels every 15 minutes. Prepare emergency response kit.',
      confidence: 87
    },
    {
      id: '3',
      title: 'Equipment Health',
      description: 'Node uptime stable at 99.8%. Signal strength optimal. No maintenance required.',
      severity: 'low',
      recommendation: 'Continue standard monitoring protocol.',
      confidence: 99
    }
  ]);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLastScanTime(new Date().toLocaleTimeString());
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch(severity) {
      case 'critical': return 'rgba(239, 68, 68, 0.15)';
      case 'high': return 'rgba(245, 158, 11, 0.15)';
      case 'medium': return 'rgba(59, 130, 246, 0.15)';
      case 'low': return 'rgba(16, 185, 129, 0.15)';
      default: return 'rgba(107, 114, 128, 0.15)';
    }
  };

  const scanPhases = [
    { name: 'Data Ingestion', progress: 25 },
    { name: 'Pattern Analysis', progress: 50 },
    { name: 'Risk Assessment', progress: 75 },
    { name: 'Report Generation', progress: 100 }
  ];

  return (
    <div className="ai-scan-page">
      <div className="page-header">
        <div className="header-content">
          <Brain size={28} className="header-icon" />
          <div>
            <h1>AI Risk Scan</h1>
            <p>Gemini-powered environmental analysis & threat detection</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={startScan} disabled={isScanning}>
            {isScanning ? <RefreshCw size={16} className="spin" /> : <Scan size={16} />}
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>
      </div>

      {isScanning && (
        <div className="scan-progress-card">
          <div className="progress-header">
            <Sparkles size={20} className="sparkle" />
            <span>AI Analysis in Progress</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${scanProgress}%` }} />
          </div>
          <div className="progress-phases">
            {scanPhases.map((phase, i) => (
              <div 
                key={i} 
                className={`phase ${scanProgress >= phase.progress ? 'active' : ''}`}
              >
                {scanProgress >= phase.progress ? <CheckCircle size={12} /> : <Clock size={12} />}
                <span>{phase.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <Target size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Last Scan</span>
            <span className="stat-value">{lastScanTime || 'Never'}</span>
          </div>
        </div>
        <div className="stat-card">
          <AlertTriangle size={24} className="stat-icon warning" />
          <div className="stat-info">
            <span className="stat-label">Issues Found</span>
            <span className="stat-value">{results.filter(r => r.severity !== 'low').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <Shield size={24} className="stat-icon success" />
          <div className="stat-info">
            <span className="stat-label">Risk Score</span>
            <span className="stat-value">{100 - risks.composite}/100</span>
          </div>
        </div>
        <div className="stat-card">
          <Brain size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">AI Confidence</span>
            <span className="stat-value">94%</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="results-section">
          <div className="section-header">
            <h2><Scan size={20} /> Scan Results</h2>
            <span className="result-count">{results.length} findings</span>
          </div>
          
          <div className="results-list">
            {results.map((result) => (
              <div 
                key={result.id}
                className={`result-card ${selectedResult?.id === result.id ? 'selected' : ''}`}
                onClick={() => setSelectedResult(result)}
                style={{ borderColor: selectedResult?.id === result.id ? getSeverityColor(result.severity) : 'transparent' }}
              >
                <div className="result-header">
                  <div 
                    className="severity-badge"
                    style={{ background: getSeverityBg(result.severity), color: getSeverityColor(result.severity) }}
                  >
                    {result.severity.toUpperCase()}
                  </div>
                  <div className="confidence-badge">
                    <Activity size={12} />
                    {result.confidence}%
                  </div>
                </div>
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                <div className="result-footer">
                  <span className="recommendation">
                    <Zap size={12} />
                    {result.recommendation}
                  </span>
                  <ChevronRight size={16} className="arrow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          {selectedResult ? (
            <div className="detail-card">
              <div className="detail-header" style={{ borderColor: getSeverityColor(selectedResult.severity) }}>
                <div 
                  className="detail-icon"
                  style={{ background: getSeverityColor(selectedResult.severity) }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2>{selectedResult.title}</h2>
                  <span 
                    className="severity-label"
                    style={{ color: getSeverityColor(selectedResult.severity) }}
                  >
                    {selectedResult.severity.toUpperCase()} SEVERITY
                  </span>
                </div>
              </div>
              
              <div className="detail-body">
                <div className="detail-row">
                  <span className="detail-label">Description</span>
                  <p>{selectedResult.description}</p>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">AI Recommendation</span>
                  <p className="recommendation-text">{selectedResult.recommendation}</p>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Confidence Score</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${selectedResult.confidence}%`, background: getSeverityColor(selectedResult.severity) }}
                    />
                  </div>
                  <span className="confidence-value">{selectedResult.confidence}%</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Related Metrics</span>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-name">TDS</span>
                      <span className="metric-value">{data?.tds ? Math.round(data.tds) : '--'} ppm</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-name">Drain</span>
                      <span className="metric-value">{data?.w1 ? data.w1.toFixed(1) : '--'} cm</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-name">Tank</span>
                      <span className="metric-value">{data?.w2 ? data.w2.toFixed(1) : '--'} cm</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-name">Flood Risk</span>
                      <span className="metric-value">{risks.flood}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <button className="detail-btn primary">
                  <FileText size={16} />
                  Export Report
                </button>
                <button className="detail-btn secondary">
                  <Settings size={16} />
                  Configure Alert
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <Brain size={48} />
              <h3>Select a Result</h3>
              <p>Click on a scan result to view detailed analysis and recommendations.</p>
            </div>
          )}
        </div>
      </div>

      <div className="ai-insights">
        <h3><Sparkles size={18} /> AI Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <TrendingUp size={20} />
            <div>
              <span className="insight-title">Trend Analysis</span>
              <p>TDS levels showing upward trend. Monitor for next 2 hours.</p>
            </div>
          </div>
          <div className="insight-card">
            <AlertTriangle size={20} />
            <div>
              <span className="insight-title">Weather Impact</span>
              <p>Forecasted rain in 4 hours may increase flood risk by 15%.</p>
            </div>
          </div>
          <div className="insight-card">
            <CheckCircle size={20} />
            <div>
              <span className="insight-title">System Status</span>
              <p>All sensors operational. Data quality at 99.2%.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ai-scan-page {
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
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          color: #8b5cf6;
          padding: 12px;
          background: rgba(139, 92, 246, 0.2);
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

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }

        .action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .scan-progress-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .sparkle {
          color: #8b5cf6;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .progress-bar-container {
          height: 8px;
          background: var(--s1, #222);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-phases {
          display: flex;
          justify-content: space-between;
        }

        .phase {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--dim, #666);
        }

        .phase.active {
          color: #8b5cf6;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 14px;
        }

        .stat-icon {
          color: #8b5cf6;
          padding: 10px;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 10px;
        }

        .stat-icon.warning { color: #f59e0b; background: rgba(245, 158, 11, 0.15); }
        .stat-icon.success { color: #10b981; background: rgba(16, 185, 129, 0.15); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 11px;
          color: var(--dim, #888);
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--fg, #fff);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .results-section {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0;
        }

        .result-count {
          font-size: 12px;
          color: var(--dim, #888);
          background: var(--s1, #222);
          padding: 4px 10px;
          border-radius: 20px;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .result-card {
          padding: 16px;
          background: var(--s1, #222);
          border: 1px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .result-card:hover, .result-card.selected {
          background: var(--s2, #1a1a2e);
          border-width: 2px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .severity-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .confidence-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--dim, #888);
        }

        .result-card h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--fg, #fff);
          margin: 0 0 6px;
        }

        .result-card p {
          font-size: 12px;
          color: var(--mid, #aaa);
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .result-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recommendation {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: var(--dim, #888);
        }

        .arrow {
          color: var(--dim, #555);
        }

        .detail-section {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          overflow: hidden;
        }

        .detail-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-bottom: 2px solid;
        }

        .detail-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .detail-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0;
        }

        .severity-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .detail-body {
          padding: 20px;
          flex: 1;
        }

        .detail-row {
          margin-bottom: 20px;
        }

        .detail-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--dim, #888);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .detail-body p {
          font-size: 13px;
          color: var(--mid, #aaa);
          line-height: 1.5;
          margin: 0;
        }

        .recommendation-text {
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border-left: 3px solid #8b5cf6;
        }

        .confidence-bar {
          height: 6px;
          background: var(--s1, #222);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .confidence-fill {
          height: 100%;
          border-radius: 3px;
        }

        .confidence-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--fg, #fff);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: var(--s1, #222);
          border-radius: 8px;
        }

        .metric-name {
          font-size: 11px;
          color: var(--dim, #888);
        }

        .metric-value {
          font-size: 12px;
          font-weight: 600;
          color: var(--fg, #fff);
        }

        .detail-actions {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border, #333);
        }

        .detail-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .detail-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          border: none;
          color: #fff;
        }

        .detail-btn.secondary {
          background: transparent;
          border: 1px solid var(--border, #444);
          color: var(--fg, #fff);
        }

        .detail-btn:hover {
          transform: translateY(-2px);
        }

        .no-selection {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          color: var(--dim, #666);
        }

        .no-selection h3 {
          font-size: 18px;
          color: var(--fg, #fff);
          margin: 16px 0 8px;
        }

        .no-selection p {
          font-size: 13px;
          color: var(--mid, #888);
          max-width: 200px;
        }

        .ai-insights {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 20px;
        }

        .ai-insights h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0 0 16px;
        }

        .ai-insights h3 svg {
          color: #8b5cf6;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--s1, #222);
          border-radius: 12px;
        }

        .insight-card svg {
          color: #8b5cf6;
          flex-shrink: 0;
        }

        .insight-title {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--fg, #fff);
          margin-bottom: 4px;
        }

        .insight-card p {
          font-size: 11px;
          color: var(--mid, #aaa);
          margin: 0;
          line-height: 1.4;
        }

        @media (max-width: 1024px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .content-grid { grid-template-columns: 1fr; }
          .insights-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AIScanPage;
