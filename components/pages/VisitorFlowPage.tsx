import React, { useState, useEffect } from 'react';
import { LiveData, HistoryData, RiskScores } from '../../types';
import { Users, Car, Mountain, Utensils, TrendingDown, Activity, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface VisitorFlowPageProps {
  data: LiveData | null;
  history: HistoryData;
  risks: RiskScores;
}

const VisitorFlowPage: React.FC<VisitorFlowPageProps> = ({ data, history, risks }) => {
  const [demoData] = useState({
    slopeOccupancy: 67,
    parkingAvailable: 234,
    parkingTotal: 500,
    restaurantOccupancy: 45,
    liftWaitTime: 8,
    visitorsToday: 3420,
    peakHours: '10:00 - 14:00',
    co2Saved: 1250,
  });

  const occupancyColor = demoData.slopeOccupancy > 80 ? '#ef4444' : demoData.slopeOccupancy > 60 ? '#f59e0b' : '#10b981';
  const parkingPercent = Math.round((demoData.parkingAvailable / demoData.parkingTotal) * 100);

  return (
    <div className="visitor-flow-page">
      <div className="page-grid">
        {/* Header */}
        <div className="stat-card header-stat">
          <div className="stat-icon visitor">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Visitor Flow Management</div>
            <div className="stat-value">SKI RESORT AI</div>
            <div className="stat-sub">Intelligent crowd optimization & traffic control</div>
          </div>
        </div>

        {/* Live Visitor Count */}
        <div className="stat-card visitor-count-card">
          <div className="card-header">
            <Users size={20} />
            <span>Current Visitors</span>
          </div>
          <div className="visitor-count">
            <span className="count">{demoData.visitorsToday.toLocaleString()}</span>
            <span className="label">today</span>
          </div>
          <div className="visitor-trend">
            <TrendingDown size={16} />
            <span>12% less than yesterday</span>
          </div>
        </div>

        {/* Slope Occupancy */}
        <div className="stat-card slope-card">
          <div className="card-header">
            <Mountain size={20} />
            <span>Slope Occupancy</span>
            <span className={`status-badge ${demoData.slopeOccupancy > 80 ? 'danger' : demoData.slopeOccupancy > 60 ? 'warning' : 'safe'}`}>
              {demoData.slopeOccupancy > 80 ? 'CROWDED' : demoData.slopeOccupancy > 60 ? 'BUSY' : 'OPTIMAL'}
            </span>
          </div>
          <div className="occupancy-gauge">
            <svg viewBox="0 0 200 120" className="gauge-svg">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#333"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={occupancyColor}
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${demoData.slopeOccupancy * 2.51} 251`}
              />
            </svg>
            <div className="gauge-value">
              <span className="percent">{demoData.slopeOccupancy}</span>
              <span className="unit">%</span>
            </div>
          </div>
          <div className="slope-recommendation">
            <AlertTriangle size={14} />
            <span>North slope has low traffic - redirect visitors</span>
          </div>
        </div>

        {/* Parking Status */}
        <div className="stat-card parking-card">
          <div className="card-header">
            <Car size={20} />
            <span>Smart Parking</span>
          </div>
          <div className="parking-visual">
            <div className="parking-icon">
              <Car size={32} />
            </div>
            <div className="parking-numbers">
              <span className="available">{demoData.parkingAvailable}</span>
              <span className="separator">/</span>
              <span className="total">{demoData.parkingTotal}</span>
            </div>
            <span className="parking-label">spaces available</span>
          </div>
          <div className="parking-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${parkingPercent}%` }} />
            </div>
            <span className="progress-label">{parkingPercent}% full</span>
          </div>
          <div className="parking-impact">
            <CheckCircle size={14} />
            <span>50% less congestion during peak hours</span>
          </div>
        </div>

        {/* Restaurant Capacity */}
        <div className="stat-card restaurant-card">
          <div className="card-header">
            <Utensils size={20} />
            <span>Restaurant Capacity</span>
          </div>
          <div className="restaurant-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="restaurant-item">
                <div className="restaurant-name">Lodge {i}</div>
                <div className="restaurant-bar">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${Math.random() * 60 + 30}%`,
                      background: Math.random() > 0.5 ? '#10b981' : '#f59e0b'
                    }} 
                  />
                </div>
                <div className="restaurant-status">
                  {Math.random() > 0.5 ? 'Available' : 'Busy'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lift Wait Times */}
        <div className="stat-card lift-card">
          <div className="card-header">
            <Activity size={20} />
            <span>Lift Wait Times</span>
          </div>
          <div className="lift-list">
            <div className="lift-item">
              <span className="lift-name">Express Lift A</span>
              <span className="lift-time wait-low">3 min</span>
            </div>
            <div className="lift-item">
              <span className="lift-name">Chair Lift B</span>
              <span className="lift-time wait-med">8 min</span>
            </div>
            <div className="lift-item">
              <span className="lift-name">Cable Car C</span>
              <span className="lift-time wait-high">15 min</span>
            </div>
            <div className="lift-item">
              <span className="lift-name">T-Bar D</span>
              <span className="lift-time wait-low">2 min</span>
            </div>
          </div>
        </div>

        {/* Benefits Cards */}
        <div className="benefit-card">
          <div className="benefit-icon">
            <TrendingDown size={28} />
          </div>
          <h3>Balanced Slope Utilization</h3>
          <p>Avoid overcrowding and bottlenecks through real-time analysis of visitor flow across all slopes.</p>
          <ul className="benefit-list">
            <li><CheckCircle size={14} /> Live slope monitoring</li>
            <li><CheckCircle size={14} /> AI-driven recommendations</li>
            <li><CheckCircle size={14} /> Dynamic rerouting</li>
          </ul>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon parking">
            <Car size={28} />
          </div>
          <h3>Smart Traffic Control</h3>
          <p>AI-powered parking guidance system dynamically directs skiers to available parking spaces before reaching the resort.</p>
          <ul className="benefit-list">
            <li><CheckCircle size={14} /> Real-time space detection</li>
            <li><CheckCircle size={14} /> Digital display integration</li>
            <li><CheckCircle size={14} /> Mobile app guidance</li>
          </ul>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon eco">
            <Activity size={28} />
          </div>
          <h3>Sustainability Impact</h3>
          <p>Reduction of CO2 emissions through optimized traffic flows, less parking search traffic, and better visitor distribution.</p>
          <ul className="benefit-list">
            <li><CheckCircle size={14} /> {demoData.co2Saved}kg CO2 saved today</li>
            <li><CheckCircle size={14} /> Reduced idle traffic</li>
            <li><CheckCircle size={14} /> ESG compliance</li>
          </ul>
        </div>

        {/* Stats Footer */}
        <div className="stats-row">
          <div className="mini-stat">
            <Clock size={16} />
            <span>Peak Hours</span>
            <strong>{demoData.peakHours}</strong>
          </div>
          <div className="mini-stat">
            <MapPin size={16} />
            <span>Lifts Active</span>
            <strong>4/4</strong>
          </div>
          <div className="mini-stat">
            <Activity size={16} />
            <span>System Status</span>
            <strong>Optimal</strong>
          </div>
        </div>
      </div>

      <style>{`
        .visitor-flow-page {
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
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          border-color: #6366f1;
        }
        
        .stat-icon.visitor {
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          padding: 16px;
          border-radius: 16px;
          color: #fff;
        }
        
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin: 4px 0;
        }
        
        .stat-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          font-weight: 600;
          flex-wrap: wrap;
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
        .status-badge.danger { background: #ef4444; color: #fff; }
        
        .visitor-count-card {
          grid-column: span 4;
        }
        
        .visitor-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 20px 0;
        }
        
        .visitor-count .count {
          font-size: 48px;
          font-weight: 700;
          color: var(--fg, #fff);
        }
        
        .visitor-count .label {
          font-size: 14px;
          color: var(--dim, #888);
        }
        
        .visitor-trend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #10b981;
        }
        
        .slope-card {
          grid-column: span 4;
        }
        
        .occupancy-gauge {
          position: relative;
          width: 100%;
          max-width: 180px;
          margin: 0 auto;
        }
        
        .gauge-svg {
          width: 100%;
          height: auto;
        }
        
        .gauge-value {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }
        
        .gauge-value .percent {
          font-size: 36px;
          font-weight: 700;
          color: var(--fg, #fff);
        }
        
        .gauge-value .unit {
          font-size: 16px;
          color: var(--dim, #888);
        }
        
        .slope-recommendation {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          padding: 10px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 8px;
          font-size: 11px;
          color: #f59e0b;
        }
        
        .parking-card {
          grid-column: span 4;
        }
        
        .parking-visual {
          text-align: center;
          padding: 20px 0;
        }
        
        .parking-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin: 0 auto 16px;
        }
        
        .parking-numbers {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
        }
        
        .parking-numbers .available {
          font-size: 42px;
          font-weight: 700;
          color: var(--fg, #fff);
        }
        
        .parking-numbers .separator,
        .parking-numbers .total {
          font-size: 18px;
          color: var(--dim, #888);
        }
        
        .parking-label {
          font-size: 11px;
          color: var(--dim, #888);
          display: block;
          margin-top: 4px;
        }
        
        .parking-progress {
          margin: 16px 0;
        }
        
        .progress-bar {
          height: 8px;
          background: var(--s1, #222);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #06b6d4);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .progress-label {
          font-size: 10px;
          color: var(--dim, #888);
          display: block;
          margin-top: 6px;
          text-align: center;
        }
        
        .parking-impact {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #10b981;
          padding: 10px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 8px;
        }
        
        .restaurant-card {
          grid-column: span 6;
        }
        
        .restaurant-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        .restaurant-item {
          text-align: center;
          padding: 12px;
          background: var(--s1, #222);
          border-radius: 10px;
        }
        
        .restaurant-name {
          font-size: 10px;
          color: var(--dim, #888);
          margin-bottom: 8px;
        }
        
        .restaurant-bar {
          height: 60px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        
        .bar-fill {
          width: 20px;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }
        
        .restaurant-status {
          font-size: 9px;
          color: var(--mid, #aaa);
          margin-top: 8px;
        }
        
        .lift-card {
          grid-column: span 6;
        }
        
        .lift-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .lift-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--s1, #222);
          border-radius: 10px;
        }
        
        .lift-name {
          font-size: 12px;
          color: var(--fg, #fff);
        }
        
        .lift-time {
          font-size: 14px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
        }
        
        .wait-low { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .wait-med { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .wait-high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        
        .benefit-card {
          grid-column: span 4;
          background: var(--s2, #1a1a2e);
          border: 1px solid var(--border, #333);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        
        .benefit-card:hover {
          transform: translateY(-4px);
          border-color: #a78bfa;
        }
        
        .benefit-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-bottom: 16px;
        }
        
        .benefit-icon.parking {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
        }
        
        .benefit-icon.eco {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .benefit-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--fg, #fff);
          margin-bottom: 8px;
        }
        
        .benefit-card p {
          font-size: 12px;
          color: var(--mid, #aaa);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        
        .benefit-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .benefit-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--dim, #888);
          margin-bottom: 8px;
        }
        
        .benefit-list li svg {
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
          .visitor-count-card, .slope-card, .parking-card, .benefit-card {
            grid-column: span 6;
          }
          
          .restaurant-card, .lift-card {
            grid-column: span 12;
          }
        }
        
        @media (max-width: 640px) {
          .visitor-count-card, .slope-card, .parking-card, .restaurant-card, .lift-card, .benefit-card {
            grid-column: span 12;
          }
          
          .restaurant-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stats-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default VisitorFlowPage;
