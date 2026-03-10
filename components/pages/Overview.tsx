import React from 'react';
import { GeoSenseData } from '../../types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface OverviewProps {
  data: GeoSenseData;
  history: any;
}

const Overview: React.FC<OverviewProps> = ({ data, history }) => {
  const chartOptions = (color: string, min: number, max: number) => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min, max }
    },
    elements: {
      point: { radius: 0 },
      line: { borderWidth: 2, tension: 0.4 }
    }
  });

  const chartData = (label: string, data: number[], color: string) => ({
    labels: data.map((_, i) => i),
    datasets: [{
      label,
      data,
      borderColor: color,
      backgroundColor: color + '20',
      fill: true,
    }]
  });

  const getBadgeClass = (level: string) => {
    if (level === 'SAFE') return 'badge-safe';
    if (level === 'WARN') return 'badge-warn';
    return 'badge-danger';
  };

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

  return (
    <div className="page active">
      <div className="pg-header">
        <div className="pg-title">System Overview</div>
        <div className="pg-sub">All sensors · Real-time monitoring · GeoSense Node v1.0</div>
        <div className="pg-divider"></div>
      </div>
      <div className="g4">
        <div className="card">
          <div className="card-h"><div className="card-title">Temperature</div><div className={`badge ${getBadgeClass(tLevel)}`}>{tLevel}</div></div>
          <div className="big-num"><div><span className="bn-val c-red">{data.temperature.toFixed(1)}</span><span className="bn-unit">°C</span></div><div className="bn-label">DHT22 Sensor</div></div>
          <div className="chart-box short">
            <Line options={chartOptions('#ff2d55', 20, 55)} data={chartData('Temp', history.temp, '#ff2d55')} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-title">Humidity</div><div className="badge badge-info">{data.humidity.toFixed(0)}%</div></div>
          <div className="big-num"><div><span className="bn-val c-blue">{data.humidity.toFixed(1)}</span><span className="bn-unit">%</span></div><div className="bn-label">Relative Humidity</div></div>
          <div className="chart-box short">
            <Line options={chartOptions('#2dc8f0', 0, 100)} data={chartData('Humid', history.humid, '#2dc8f0')} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-title">Air Quality</div><div className={`badge ${getBadgeClass(aLevel)}`}>{aLevel}</div></div>
          <div className="big-num"><div><span className="bn-val c-yellow">{data.aqi}</span><span className="bn-unit">AQI</span></div><div className="bn-label">MQ-135 Sensor</div></div>
          <div className="chart-box short">
            <Line options={chartOptions('#ffc940', 0, 300)} data={chartData('AQI', history.aqi, '#ffc940')} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-title">Water Level</div><div className={`badge ${getBadgeClass(wLevel)}`}>{wLevel}</div></div>
          <div className="big-num"><div><span className="bn-val c-blue">{data.water_level_pct.toFixed(1)}</span><span className="bn-unit">%</span></div><div className="bn-label">HC-SR04 Ultrasonic</div></div>
          <div className="chart-box short">
            <Line options={chartOptions('#2dc8f0', 0, 100)} data={chartData('Water', history.water, '#2dc8f0')} />
          </div>
        </div>
      </div>
      <div className="g4 mt">
        <div className="card">
          <div className="card-h"><div className="card-title">Water Quality (TDS)</div><div className={`badge ${getBadgeClass(qLevel)}`}>{qLevel}</div></div>
          <div className="big-num"><div><span className="bn-val c-orange">{Math.round(data.tds_ppm)}</span><span className="bn-unit">ppm</span></div><div className="bn-label">TDS Probe</div></div>
          <div className="chart-box short">
            <Line options={chartOptions('#ff6820', 0, 600)} data={chartData('TDS', history.tds, '#ff6820')} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-title">Vibration</div><div className={`badge ${getBadgeClass(vLevel)}`}>{vLevel}</div></div>
          <div className="big-num"><div><span className="bn-val c-mid">{data.vibration_g.toFixed(3)}</span><span className="bn-unit">g</span></div><div className="bn-label">MPU6050 Magnitude</div></div>
          <div className="chart-box short">
            <Line options={chartOptions('#6a8a9a', 0, 1)} data={chartData('Vib', history.vib, '#6a8a9a')} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-title">GPS Location</div><div className={`badge ${data.gps_fix ? 'badge-safe' : 'badge-warn'}`}>{data.gps_fix ? 'FIXED' : 'ACQUIRING'}</div></div>
          <div className="big-num">
            <div style={{fontFamily:'var(--mono)', fontSize:'13px', color:'var(--green)', lineHeight:'1.9'}}>
              <span>{data.gps_lat.toFixed(6)}°</span><br/><span>{data.gps_lng.toFixed(6)}°</span>
            </div>
            <div className="bn-label">GY-NEO6MV2</div>
          </div>
          <div style={{padding:'0 14px 12px', fontFamily:'var(--mono)', fontSize:'10px', color:'var(--dim)'}}>Satellites: <span className="c-green">{data.gps_satellites}</span></div>
        </div>
        <div className="card">
          <div className="card-h"><div className="card-title">Node Health</div><div className="badge badge-safe">ONLINE</div></div>
          <div className="stat-grid">
            <div className="stat-cell"><div className="sc-label">Uptime</div><div className="sc-val c-green">{Math.floor(data.uptime_sec/60)}m</div></div>
            <div className="stat-cell"><div className="sc-label">WiFi RSSI</div><div className="sc-val c-blue">{data.wifi_rssi}dBm</div></div>
            <div className="stat-cell"><div className="sc-label">MPU OK</div><div className="sc-val" style={{color:data.mpu_ok?'#00e0a0':'#ff2d55'}}>{data.mpu_ok ? '✓ Online' : '✗ Error'}</div></div>
            <div className="stat-cell"><div className="sc-label">ADXL OK</div><div className="sc-val" style={{color:data.adxl_ok?'#00e0a0':'#ff2d55'}}>{data.adxl_ok ? '✓ Online' : '✗ Error'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
