import React from 'react';
import { GeoSenseData } from '../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  data: GeoSenseData;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, data }) => {
  const getRiskLevel = (val: number, safe: number, warn: number) => {
    if (val < safe) return 'SAFE';
    if (val < warn) return 'WARN';
    return 'DANGER';
  };

  const tLevel = getRiskLevel(data.temperature, 35, 42);
  const aLevel = getRiskLevel(data.aqi, 100, 150);
  const wLevel = getRiskLevel(data.water_level_pct, 50, 75);
  const qLevel = getRiskLevel(data.tds_ppm, 300, 500);
  const vLevel = getRiskLevel(data.vibration_g, 0.1, 0.5);

  const getBadgeClass = (level: string) => {
    if (level === 'SAFE') return 'nb-safe';
    if (level === 'WARN') return 'nb-warn';
    return 'nb-danger';
  };

  const NavItem = ({ page, icon, label, badgeText, badgeClass }: any) => (
    <div 
      className={`nav-item ${activePage === page ? 'active' : ''}`}
      onClick={() => onNavigate(page)}
    >
      <div className="nav-icon">{icon}</div>
      <div className="nav-label">{label}</div>
      <div className={`nav-badge ${badgeClass}`}>{badgeText}</div>
    </div>
  );

  return (
    <div id="sidebar" className="sidebar">
      <div className="sb-section">Navigation</div>
      <NavItem page="overview" icon="⬡" label="Overview" badgeText="LIVE" badgeClass="nb-info" />
      <div className="sb-divider"></div>
      <div className="sb-section">Sensor Analysis</div>
      <NavItem page="heat" icon="🌡️" label="Heat & Climate" badgeText={tLevel} badgeClass={getBadgeClass(tLevel)} />
      <NavItem page="air" icon="😷" label="Air Quality" badgeText={aLevel} badgeClass={getBadgeClass(aLevel)} />
      <NavItem page="flood" icon="🌊" label="Water Level" badgeText={wLevel} badgeClass={getBadgeClass(wLevel)} />
      <NavItem page="tds" icon="🧪" label="Water Quality" badgeText={qLevel} badgeClass={getBadgeClass(qLevel)} />
      <NavItem page="seismic" icon="🌍" label="Seismic" badgeText={vLevel} badgeClass={getBadgeClass(vLevel)} />
      <NavItem page="gps" icon="🛰️" label="GPS Location" badgeText={data.gps_fix ? 'FIX' : 'NO FIX'} badgeClass={data.gps_fix ? 'nb-safe' : 'nb-warn'} />
      <div className="sb-divider"></div>
      <div className="sb-section">Intelligence</div>
      <NavItem page="risk" icon="⚠️" label="Risk Report" badgeText="MOD" badgeClass="nb-warn" />
    </div>
  );
};

export default Sidebar;
