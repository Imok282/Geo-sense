import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Line, Doughnut, Radar } from 'react-chartjs-2';
import { SensorData } from '../types';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Activity, 
  Zap, 
  FlaskConical, 
  Wifi, 
  LayoutDashboard,
  MapPin,
  Signal
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  RadialLinearScale
);

interface ProDashboardProps {
  data: SensorData;
}

const ProDashboard: React.FC<ProDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // History state for charts
  const [history, setHistory] = useState<{
    temp: number[];
    humid: number[];
    aqi: number[];
    water: number[];
    tds: number[];
    vib: number[];
    ph: number[];
    turbidity: number[];
    voltage: number[];
    power: number[];
    labels: string[];
  }>({
    temp: [],
    humid: [],
    aqi: [],
    water: [],
    tds: [],
    vib: [],
    ph: [],
    turbidity: [],
    voltage: [],
    power: [],
    labels: []
  });

  useEffect(() => {
    setHistory(prev => {
      const newLabels = [...prev.labels, new Date().toLocaleTimeString()];
      if (newLabels.length > 20) newLabels.shift();

      const updateSeries = (series: number[], value: number) => {
        const newSeries = [...series, value];
        if (newSeries.length > 20) newSeries.shift();
        return newSeries;
      };

      return {
        temp: updateSeries(prev.temp, data.temperature),
        humid: updateSeries(prev.humid, data.humidity),
        aqi: updateSeries(prev.aqi, data.aqi),
        water: updateSeries(prev.water, data.waterLevel || 0),
        tds: updateSeries(prev.tds, data.tds || 0),
        vib: updateSeries(prev.vib, data.vibration || 0),
        ph: updateSeries(prev.ph, data.ph || 7),
        turbidity: updateSeries(prev.turbidity, data.turbidity || 0),
        voltage: updateSeries(prev.voltage, data.voltage || 0),
        power: updateSeries(prev.power, data.power || 0),
        labels: newLabels
      };
    });
  }, [data]);

  // --- Chart Options ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    plugins: {
      legend: { display: false }
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4, borderWidth: 2 }
    }
  };

  const createChartData = (label: string, dataPoints: number[], color: string) => ({
    labels: history.labels,
    datasets: [
      {
        label,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + '20', // Transparent fill
        fill: true,
      },
    ],
  });

  // --- Helper for Risk Levels ---
  const getRiskLevel = (val: number, safe: number, warn: number) => {
    if (val <= safe) return { label: 'SAFE', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (val <= warn) return { label: 'WARN', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'CRIT', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const tempRisk = getRiskLevel(data.temperature, 35, 40);
  const aqiRisk = getRiskLevel(data.aqi, 100, 150);
  const waterRisk = getRiskLevel(data.waterLevel || 0, 50, 80);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'heat', label: 'Heat', icon: Thermometer },
    { id: 'air', label: 'Air', icon: Wind },
    { id: 'flood', label: 'Flood', icon: Droplets },
    { id: 'seismic', label: 'Seismic', icon: Activity },
    { id: 'energy', label: 'Energy', icon: Zap },
    { id: 'quality', label: 'Quality', icon: FlaskConical },
    { id: 'connect', label: 'Connect', icon: Wifi },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-200 font-sans p-6 overflow-y-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .font-mono-jb { font-family: 'JetBrains Mono', monospace; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-[#131724] p-6 rounded-2xl border border-[#1f263b]">
        <div>
          <h1 className="text-3xl font-outfit font-extrabold tracking-tight text-white">
            GEOSENSE<span className="text-[#5c4dff]">PRO</span>
          </h1>
          <p className="text-xs font-mono-jb text-slate-500 tracking-widest mt-1">AI CLIMATE INTELLIGENCE v2.1</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-[#1c2235] rounded-lg border border-[#2d3753] flex items-center gap-3">
              <span className="text-[10px] font-mono-jb text-slate-400">STATUS</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
              </span>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl font-outfit font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#5c4dff] text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-[#131724] text-slate-400 border border-[#1f263b] hover:bg-[#1c2235]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Metrics Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {(activeTab === 'overview' || activeTab === 'heat') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Temperature</span>
                <span className={`px-2 py-1 rounded text-[10px] font-mono-jb font-bold border ${tempRisk.bg} ${tempRisk.color}`}>{tempRisk.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.temperature.toFixed(1)}</span>
                <span className="text-slate-500 font-medium">°C</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Temp', history.temp, '#ef4444')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'heat') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Humidity</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">NORMAL</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.humidity.toFixed(0)}</span>
                <span className="text-slate-500 font-medium">%</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Humid', history.humid, '#3b82f6')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'air') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Air Quality</span>
                <span className={`px-2 py-1 rounded text-[10px] font-mono-jb font-bold border ${aqiRisk.bg} ${aqiRisk.color}`}>{aqiRisk.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.aqi}</span>
                <span className="text-slate-500 font-medium">AQI</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('AQI', history.aqi, '#f59e0b')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'flood') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Water Level</span>
                <span className={`px-2 py-1 rounded text-[10px] font-mono-jb font-bold border ${waterRisk.bg} ${waterRisk.color}`}>{waterRisk.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.waterLevel?.toFixed(0) || 0}</span>
                <span className="text-slate-500 font-medium">%</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Water', history.water, '#3b82f6')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'quality') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">TDS (PPM)</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {data.tds && data.tds > 500 ? 'UNSAFE' : 'OK'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.tds?.toFixed(0) || 0}</span>
                <span className="text-slate-500 font-medium">ppm</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('TDS', history.tds, '#f97316')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'quality') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">pH Level</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {data.ph && (data.ph < 6 || data.ph > 8) ? 'ACID/BASE' : 'NEUTRAL'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.ph?.toFixed(1) || 7.0}</span>
                <span className="text-slate-500 font-medium">pH</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('pH', history.ph, '#06b6d4')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'quality') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Turbidity</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {data.turbidity && data.turbidity > 20 ? 'MURKY' : 'CLEAR'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.turbidity?.toFixed(0) || 0}</span>
                <span className="text-slate-500 font-medium">NTU</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Turbidity', history.turbidity, '#d97706')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'seismic') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Seismic Vib</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {data.vibration && data.vibration > 0.1 ? 'DETECTED' : 'QUIET'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.vibration?.toFixed(3) || 0}</span>
                <span className="text-slate-500 font-medium">g</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Vib', history.vib, '#8b5cf6')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'overview' || activeTab === 'energy') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Power (INA219)</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">ACTIVE</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.power?.toFixed(2) || 0}</span>
                <span className="text-slate-500 font-medium">mW</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Power', history.power, '#eab308')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'energy') && (
            <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2d3753] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Voltage</span>
                <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">BUS</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-mono-jb text-4xl font-bold text-white">{data.voltage?.toFixed(2) || 0}</span>
                <span className="text-slate-500 font-medium">V</span>
              </div>
              <div className="h-16">
                <Line data={createChartData('Voltage', history.voltage, '#eab308')} options={commonOptions} />
              </div>
            </div>
          )}

          {(activeTab === 'connect') && (
             <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-[#131724] border border-[#1f263b] rounded-2xl p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest">Connectivity & Location</h3>
                  <div className="flex gap-2">
                     <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">NB-IoT</span>
                     <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">GSM</span>
                     <span className="px-2 py-1 rounded text-[10px] font-mono-jb font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">GPS</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#1c2235] rounded-xl border border-[#2d3753]">
                         <div className="flex items-center gap-3">
                            <Signal className="text-emerald-400" size={20} />
                            <div>
                               <div className="text-[10px] font-bold text-slate-500 uppercase">Signal Strength</div>
                               <div className="font-mono-jb text-xl font-bold text-white">{data.signalStrength || -85} dBm</div>
                            </div>
                         </div>
                         <div className="flex gap-1">
                            <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                            <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                            <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                            <div className="w-1 h-3 bg-slate-700 rounded-full"></div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#1c2235] rounded-xl border border-[#2d3753]">
                         <div className="flex items-center gap-3">
                            <MapPin className="text-blue-400" size={20} />
                            <div>
                               <div className="text-[10px] font-bold text-slate-500 uppercase">GPS Coordinates</div>
                               <div className="font-mono-jb text-sm font-bold text-white">
                                 {data.lat?.toFixed(6) || '28.613900'}, {data.lng?.toFixed(6) || '77.209000'}
                               </div>
                            </div>
                         </div>
                         <div className="text-[10px] font-bold text-slate-500 uppercase">{data.satellites || 0} SATS</div>
                      </div>
                   </div>
                   <div className="h-48 bg-[#0b0e17] rounded-xl border border-[#1f263b] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
                      <div className="text-center">
                         <div className="w-16 h-16 border-2 border-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-full"></div>
                         </div>
                         <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Scanning Network</div>
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>

        {/* Sidebar / Analysis Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Risk Score */}
          <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-8 text-center shadow-2xl">
            <h3 className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-[0.2em] mb-6">Composite Risk Score</h3>
            <div className="relative flex items-center justify-center">
               <svg className="w-40 h-40 transform -rotate-90">
                 <circle cx="80" cy="80" r="70" stroke="#1c2235" strokeWidth="12" fill="none" />
                 <circle 
                    cx="80" cy="80" r="70" 
                    stroke={data.aqi > 150 || data.temperature > 40 ? '#ef4444' : '#10b981'} 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray="440"
                    strokeDashoffset={440 - (440 * (data.aqi > 150 ? 80 : 20)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                 />
               </svg>
               <div className="absolute flex flex-col items-center">
                 <span className="text-5xl font-mono-jb font-bold text-white">{data.aqi > 150 ? 80 : 20}</span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">/ 100</span>
               </div>
            </div>
            <div className="mt-6 px-4 py-2 bg-[#1c2235] rounded-lg border border-[#2d3753] inline-block">
              <span className={`font-mono-jb font-bold text-xs ${data.aqi > 150 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.aqi > 150 ? 'HIGH RISK' : 'LOW RISK'}
              </span>
            </div>
          </div>

          {/* System Logs / Ticker */}
          <div className="bg-[#131724] border border-[#1f263b] rounded-2xl p-6 h-64 overflow-hidden flex flex-col">
             <h3 className="font-outfit font-bold text-xs text-slate-500 uppercase tracking-widest mb-4">Live System Feed</h3>
             <div className="flex-1 overflow-y-auto space-y-3 font-mono-jb text-[10px] custom-scrollbar">
                <div className="flex gap-3 text-slate-400 border-b border-[#1f263b] pb-2">
                   <span className="text-emerald-500">12:42:01</span>
                   <span>SYS: DATA_PACKET_RX_OK</span>
                </div>
                <div className="flex gap-3 text-slate-400 border-b border-[#1f263b] pb-2">
                   <span className="text-emerald-500">12:42:05</span>
                   <span>AI: HEURISTIC_SCAN_COMPLETE</span>
                </div>
                <div className="flex gap-3 text-slate-400 border-b border-[#1f263b] pb-2">
                   <span className="text-blue-500">12:42:10</span>
                   <span>NET: SYNC_STABLE_12ms</span>
                </div>
                {data.aqi > 100 && (
                  <div className="flex gap-3 text-amber-400 border-b border-[#1f263b] pb-2">
                    <span className="text-amber-500">12:42:15</span>
                    <span>WARN: AQI_THRESHOLD_ELEVATED</span>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProDashboard;
