import React, { useState } from 'react';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { 
  Box, 
  Drone, 
  Shield, 
  Lock, 
  Users, 
  Mic, 
  Bird, 
  Thermometer, 
  Cloud, 
  Mountain,
  CheckCircle,
  Clock,
  Zap,
  ChevronRight,
  Rocket,
  Cpu,
  Globe,
  Radio
} from 'lucide-react';

interface AdvancedFeaturesPageProps {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'pilot' | 'coming';
  statusText: string;
  details: string[];
  color: string;
}

const features: Feature[] = [
  {
    id: 'digital-twin',
    title: 'Digital Twin of Alpine Regions',
    description: 'Full 3D real-time replica of mountain terrain with predictive flood and landslide simulation.',
    icon: <Box size={32} />,
    status: 'coming',
    statusText: 'Coming 2026',
    details: [
      'Real-time terrain mapping',
      'Flood scenario simulation',
      'Infrastructure planning tools',
      'Historical event playback'
    ],
    color: '#8b5cf6'
  },
  {
    id: 'drone-deployment',
    title: 'Autonomous Drone Deployment',
    description: 'Drones that fly to sensor-dead zones and deploy or replace sensors automatically.',
    icon: <Drone size={32} />,
    status: 'coming',
    statusText: 'Coming 2026',
    details: [
      'Self-charging stations',
      'Emergency rapid-response',
      'Payload capacity: 500g',
      '50km operational range'
    ],
    color: '#06b6d4'
  },
  {
    id: 'gecko-mounts',
    title: 'Biomimetic Gecko Mounts',
    description: 'Sensor pods that stick to any surface using gecko-inspired adhesion. No drilling needed.',
    icon: <Shield size={32} />,
    status: 'coming',
    statusText: 'Coming 2025',
    details: [
      'Works on any surface',
      'Reusable & weather-resistant',
      '50kg hold strength',
      '5-minute installation'
    ],
    color: '#10b981'
  },
  {
    id: 'quantum-encryption',
    title: 'Quantum-Ready Encryption',
    description: 'Post-quantum cryptography for government/military-grade data security.',
    icon: <Lock size={32} />,
    status: 'coming',
    statusText: 'Coming 2027',
    details: [
      'NIST-approved algorithms',
      'Future-proof security',
      'Zero-latency encryption',
      'FIPS 140-3 compliant'
    ],
    color: '#f59e0b'
  },
  {
    id: 'citizen-network',
    title: 'Citizen Sensor Network',
    description: 'Hikers wear lightweight sensors that automatically upload climate data.',
    icon: <Users size={32} />,
    status: 'pilot',
    statusText: 'Beta',
    details: [
      'Gamified rewards program',
      '50g wearable sensors',
      '10,000+ potential users',
      'Real-time data sync'
    ],
    color: '#ec4899'
  },
  {
    id: 'voice-mesh',
    title: 'Voice Emergency Mesh',
    description: 'Offline voice network that works without cell towers. Alexa for emergencies.',
    icon: <Mic size={32} />,
    status: 'coming',
    statusText: 'Coming 2026',
    details: [
      'No cellular required',
      '15km mesh range',
      'SOS beacon + GPS',
      'AI voice commands'
    ],
    color: '#ef4444'
  },
  {
    id: 'bioacoustics',
    title: 'Bioacoustics Ecosystem Health',
    description: 'Listen to insects and birds to detect ecosystem changes before its too late.',
    icon: <Bird size={32} />,
    status: 'pilot',
    statusText: 'Pilot',
    details: [
      '98% species identification',
      '24/7 acoustic monitoring',
      'Early extinction warning',
      'Biodiversity scoring'
    ],
    color: '#84cc16'
  },
  {
    id: 'thermal-imaging',
    title: 'Thermal Leak Imaging',
    description: 'Drone-mounted thermal cameras detect heat leaks in buildings from the sky.',
    icon: <Thermometer size={32} />,
    status: 'available',
    statusText: 'Available',
    details: [
      '0.1°C sensitivity',
      '100+ buildings/day',
      'Energy savings analysis',
      'Regulatory reports'
    ],
    color: '#f97316'
  },
  {
    id: 'carbon-isotope',
    title: 'Carbon Isotope Analysis',
    description: 'Distinguish natural vs man-made CO2 sources for compliance verification.',
    icon: <Cloud size={32} />,
    status: 'coming',
    statusText: 'Coming 2026',
    details: [
      'Regulatory-grade accuracy',
      'Source attribution',
      'Emissions verification',
      'Compliance reports'
    ],
    color: '#6366f1'
  },
  {
    id: 'avalanche-prediction',
    title: 'Avalanche Prediction AI',
    description: 'Snow pressure + weather + seismic = 15-minute avalanche warning.',
    icon: <Mountain size={32} />,
    status: 'pilot',
    statusText: 'Pilot',
    details: [
      '15-minute warning',
      'Automatic road closure',
      'Ski resort protection',
      'Real-time risk maps'
    ],
    color: '#0ea5e9'
  }
];

const AdvancedFeaturesPage: React.FC<AdvancedFeaturesPageProps> = ({ data, history, risks }) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return '#10b981';
      case 'pilot': return '#f59e0b';
      case 'coming': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="advanced-features-page">
      <div className="page-header">
        <div className="header-content">
          <Zap size={28} className="header-icon" />
          <div>
            <h1>Advanced Features</h1>
            <p>World-first innovations exclusive to GeoSense PRO</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-pill available">
            <CheckCircle size={14} />
            <span>3 Available</span>
          </div>
          <div className="stat-pill pilot">
            <Rocket size={14} />
            <span>3 Pilot</span>
          </div>
          <div className="stat-pill coming">
            <Clock size={14} />
            <span>4 Coming</span>
          </div>
        </div>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className={`feature-card ${selectedFeature?.id === feature.id ? 'selected' : ''}`}
            onClick={() => setSelectedFeature(feature)}
            style={{ '--feature-color': feature.color } as React.CSSProperties}
          >
            <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}88)` }}>
              {feature.icon}
            </div>
            <div className="feature-content">
              <div className="feature-header">
                <h3>{feature.title}</h3>
                <span className="feature-status" style={{ color: getStatusColor(feature.status) }}>
                  {feature.status === 'available' && <CheckCircle size={12} />}
                  {feature.status === 'pilot' && <Rocket size={12} />}
                  {feature.status === 'coming' && <Clock size={12} />}
                  {feature.statusText}
                </span>
              </div>
              <p>{feature.description}</p>
              <div className="feature-details">
                {feature.details.slice(0, 2).map((detail, i) => (
                  <span key={i} className="detail-tag">{detail}</span>
                ))}
                {feature.details.length > 2 && (
                  <span className="more-tag">+{feature.details.length - 2} more</span>
                )}
              </div>
            </div>
            <ChevronRight size={20} className="feature-arrow" />
          </div>
        ))}
      </div>

      {selectedFeature && (
        <div className="feature-modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderColor: selectedFeature.color }}>
              <div className="modal-icon" style={{ background: selectedFeature.color }}>
                {selectedFeature.icon}
              </div>
              <div>
                <h2>{selectedFeature.title}</h2>
                <span className="modal-status" style={{ color: getStatusColor(selectedFeature.status) }}>
                  {selectedFeature.statusText}
                </span>
              </div>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedFeature.description}</p>
              <h4>Key Capabilities</h4>
              <ul className="modal-list">
                {selectedFeature.details.map((detail, i) => (
                  <li key={i}>
                    <CheckCircle size={16} style={{ color: selectedFeature.color }} />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              {selectedFeature.status === 'available' ? (
                <button className="modal-btn primary">Request Demo</button>
              ) : selectedFeature.status === 'pilot' ? (
                <button className="modal-btn secondary">Join Pilot</button>
              ) : (
                <button className="modal-btn secondary">Get Notified</button>
              )}
              <button className="modal-btn text" onClick={() => setSelectedFeature(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="tech-showcase">
        <h3><Cpu size={20} /> Powered By</h3>
        <div className="tech-tags">
          <span><Globe size={14} /> Digital Twin Engine</span>
          <span><Radio size={14} /> Mesh Networking</span>
          <span><Drone size={14} /> UAV Systems</span>
          <span><Lock size={14} /> Quantum Crypto</span>
          <span><Bird size={14} /> ML Audio Analysis</span>
        </div>
      </div>

      <style>{`
        .advanced-features-page {
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
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
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

        .header-stats {
          display: flex;
          gap: 12px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .stat-pill.available { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .stat-pill.pilot { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .stat-pill.coming { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .feature-card:hover, .feature-card.selected {
          border-color: var(--feature-color);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          min-width: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .feature-content {
          flex: 1;
          min-width: 0;
        }

        .feature-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 6px;
        }

        .feature-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0;
          line-height: 1.3;
        }

        .feature-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .feature-content p {
          font-size: 11px;
          color: var(--mid, #aaa);
          margin: 0 0 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .feature-details {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .detail-tag {
          font-size: 9px;
          padding: 4px 8px;
          background: var(--s1, #222);
          border-radius: 4px;
          color: var(--dim, #888);
        }

        .more-tag {
          font-size: 9px;
          padding: 4px 8px;
          color: var(--feature-color);
          font-weight: 600;
        }

        .feature-arrow {
          color: var(--dim, #555);
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(4px);
          color: var(--feature-color);
        }

        /* Modal Styles */
        .feature-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .feature-modal {
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 24px;
          max-width: 500px;
          width: 100%;
          overflow: hidden;
          animation: modalIn 0.3s ease;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-bottom: 2px solid;
        }

        .modal-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin: 0;
        }

        .modal-status {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-description {
          font-size: 14px;
          color: var(--mid, #aaa);
          line-height: 1.6;
          margin: 0 0 20px;
        }

        .modal-body h4 {
          font-size: 12px;
          font-weight: 700;
          color: var(--fg, #fff);
          text-transform: uppercase;
          margin: 0 0 12px;
        }

        .modal-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .modal-list li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--mid, #aaa);
          padding: 8px 0;
          border-bottom: 1px solid var(--border, #333);
        }

        .modal-list li:last-child {
          border-bottom: none;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border, #333);
        }

        .modal-btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .modal-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
        }

        .modal-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }

        .modal-btn.secondary {
          background: var(--s1, #222);
          color: var(--fg, #fff);
          border: 1px solid var(--border, #333);
        }

        .modal-btn.secondary:hover {
          border-color: #8b5cf6;
        }

        .modal-btn.text {
          background: transparent;
          color: var(--dim, #888);
          flex: 0;
        }

        .modal-btn.text:hover {
          color: var(--fg, #fff);
        }

        .tech-showcase {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding: 16px 20px;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 12px;
        }

        .tech-showcase h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--fg, #fff);
          text-transform: uppercase;
          margin: 0;
        }

        .tech-showcase h3 svg {
          color: #8b5cf6;
        }

        .tech-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tech-tags span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          padding: 6px 12px;
          background: var(--s1, #222);
          border-radius: 6px;
          color: var(--dim, #888);
        }

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-stats {
            width: 100%;
            justify-content: flex-start;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedFeaturesPage;
