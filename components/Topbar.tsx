import React from 'react';
import { GeoSenseData } from '../types';

interface TopbarProps {
  data: GeoSenseData;
  nodeIP: string;
}

const Topbar: React.FC<TopbarProps> = ({ data, nodeIP }) => {
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div id="topbar" className="topbar">
      <div className="tb-brand"><div className="tb-live"></div>GEOSENSE</div>
      <div className="tb-stats">
        <div className="tb-stat"><div className="tb-stat-v c-red">{data.temperature.toFixed(1)}°</div><div className="tb-stat-l">Temp</div></div>
        <div className="tb-stat"><div className="tb-stat-v c-blue">{data.humidity.toFixed(0)}%</div><div className="tb-stat-l">Humid</div></div>
        <div className="tb-stat"><div className="tb-stat-v c-yellow">AQI{data.aqi}</div><div className="tb-stat-l">Air</div></div>
        <div className="tb-stat"><div className="tb-stat-v c-blue">{data.water_level_pct.toFixed(0)}%</div><div className="tb-stat-l">Water</div></div>
        <div className="tb-stat"><div className="tb-stat-v c-orange">{Math.round(data.tds_ppm)}ppm</div><div className="tb-stat-l">TDS</div></div>
        <div className="tb-stat"><div className="tb-stat-v c-mid">{data.vibration_g.toFixed(3)}g</div><div className="tb-stat-l">Vibration</div></div>
      </div>
      <div className="tb-right">
        <div className="tb-node">Node: <span style={{color:'var(--green)'}}>{nodeIP}</span></div>
        <div id="tb-uptime">UP: {formatTime(data.uptime_sec)}</div>
      </div>
    </div>
  );
};

export default Topbar;
