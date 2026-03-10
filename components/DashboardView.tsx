import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, CloudRain, ShieldCheck, Zap, RefreshCcw, Activity, ShieldAlert, Usb, Bluetooth, Loader2, Wifi, WifiOff, Cpu, Server, Terminal, AlertTriangle, CheckCircle, Droplets, Waves, Activity as Pulse, Sun, Signal, ArrowRight, FlaskConical, Gauge } from 'lucide-react';
import { SensorData, ClimateRisk, RiskLevel, MapNode, SensorConfig } from '../types';
import RiskRadar from './RiskRadar';
import AlertFeed from './AlertFeed';

interface DashboardViewProps {
  data: SensorData;
  risks: ClimateRisk[];
  logs: string[];
  onRefresh: () => void;
  isRefreshing: boolean;
  isHardwareConnected: boolean;
  onConnectHardware: () => void;
  onConnectWireless: () => void;
  onConnectWiFi: () => void;
  isLinking: boolean;
  nodes: MapNode[];
}

const formatVal = (val: string | number | undefined | null, unit: string = '') => {
  if (val === undefined || val === null || val === 0 || val === "0") return "--";
  return `${val}${unit}`;
};

const DashboardView: React.FC<DashboardViewProps> = ({ 
  data, 
  risks, 
  logs, 
  onRefresh, 
  isRefreshing,
  isHardwareConnected,
  onConnectHardware,
  onConnectWireless,
  onConnectWiFi,
  isLinking,
  nodes
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (nodes.length > 0 && !selectedNodeId) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNodeId]);

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const overallRisk = risks.reduce((acc, r) => acc + r.score, 0) / (risks.length || 1);
  const safetyScore = Math.max(0, 100 - overallRisk);

  const renderSensorWidgets = () => {
    const widgets: React.ReactNode[] = [];
    
    // Default widgets if no node or no sensors
    if (!activeNode || !activeNode.sensors || activeNode.sensors.length === 0) {
      return [
        <MetricCard key="temp" icon={<Thermometer size={24} className="text-black" />} label="Temperature" value={formatVal(data.temperature, '°C')} trend="+0.2%" color="rose" />,
        <MetricCard key="aqi" icon={<Wind size={24} className="text-black" />} label="Air Quality" value={formatVal(Math.round(data.aqi))} trend="Stable" color="emerald" />,
        <MetricCard key="hum" icon={<CloudRain size={24} className="text-black" />} label="Humidity" value={formatVal(Math.round(data.humidity), '%')} trend="-1.5%" color="indigo" />
      ];
    }

    // Deduplicate categories to avoid showing same widget multiple times if multiple sensors of same type exist
    const processedCategories = new Set<string>();

    activeNode.sensors.forEach((sensor, idx) => {
      const key = `${sensor.model}-${idx}`;
      
      switch (sensor.category) {
        case 'THERMAL':
          if (!processedCategories.has('TEMP')) {
            widgets.push(<MetricCard key={`${key}-temp`} icon={<Thermometer size={24} className="text-black" />} label="Temperature" value={formatVal(data.temperature, '°C')} trend="+0.2%" color="rose" />);
            processedCategories.add('TEMP');
          }
          if (sensor.model.includes('DHT') && !processedCategories.has('HUM')) {
            widgets.push(<MetricCard key={`${key}-hum`} icon={<CloudRain size={24} className="text-black" />} label="Humidity" value={formatVal(Math.round(data.humidity), '%')} trend="-1.5%" color="indigo" />);
            processedCategories.add('HUM');
          }
          break;

        case 'AIR_QUALITY':
          if (!processedCategories.has('AQI')) {
            widgets.push(<MetricCard key={`${key}-aqi`} icon={<Wind size={24} className="text-black" />} label="Air Quality" value={formatVal(Math.round(data.aqi))} trend="Stable" color="emerald" />);
            processedCategories.add('AQI');
          }
          if (sensor.model === 'MQ-135') {
             widgets.push(<MetricCard key={`${key}-co2`} icon={<Wind size={24} className="text-black" />} label="CO2 Level" value={formatVal(data.co2, 'ppm')} trend="--" color="indigo" />);
          }
          break;

        case 'WATER':
          if (sensor.model === 'HC-SR04') {
             widgets.push(<MetricCard key={`${key}-lvl`} icon={<Waves size={24} className="text-black" />} label="Water Level" value={formatVal(data.waterLevel, 'cm')} trend="--" color="indigo" />);
          }
          if (sensor.model === 'RAIN_SENSOR') {
             widgets.push(<MetricCard key={`${key}-rain`} icon={<CloudRain size={24} className="text-black" />} label="Rain Status" value={data.rainStatus || '--'} trend="--" color="indigo" />);
          }
          if (sensor.model === 'CAPACITIVE_SOIL') {
             widgets.push(<MetricCard key={`${key}-soil`} icon={<Droplets size={24} className="text-black" />} label="Soil Moisture" value={formatVal(data.soilMoisture, '%')} trend="--" color="emerald" />);
          }
          if (sensor.model === 'TDS_METER') {
             widgets.push(<MetricCard key={`${key}-tds`} icon={<FlaskConical size={24} className="text-black" />} label="TDS" value={formatVal(data.tds, 'ppm')} trend="--" color="emerald" />);
          }
          if (sensor.model === 'PH_METER') {
             widgets.push(<MetricCard key={`${key}-ph`} icon={<FlaskConical size={24} className="text-black" />} label="pH Level" value={formatVal(data.ph, '')} trend="--" color="emerald" />);
          }
          if (sensor.model === 'TURBIDITY') {
             widgets.push(<MetricCard key={`${key}-turb`} icon={<Waves size={24} className="text-black" />} label="Turbidity" value={formatVal(data.turbidity, 'NTU')} trend="--" color="emerald" />);
          }
          break;

        case 'SEISMIC':
          widgets.push(<MetricCard key={`${key}-vib`} icon={<Pulse size={24} className="text-black" />} label="Vibration" value={formatVal(data.vibration, 'g')} trend="--" color="rose" />);
          break;

        case 'ENERGY':
          if (sensor.model === 'BH1750') {
             widgets.push(<MetricCard key={`${key}-lux`} icon={<Sun size={24} className="text-black" />} label="Light Level" value={formatVal(data.luminosity, 'lx')} trend="--" color="emerald" />);
          }
          if (sensor.model === 'INA219') {
             widgets.push(<MetricCard key={`${key}-pwr`} icon={<Zap size={24} className="text-black" />} label="Power" value={formatVal(data.power, 'mW')} trend="--" color="emerald" />);
             widgets.push(<MetricCard key={`${key}-vol`} icon={<Zap size={24} className="text-black" />} label="Voltage" value={formatVal(data.voltage, 'V')} trend="--" color="emerald" />);
          }
          break;
          
        case 'CONNECTIVITY':
           if (['SIM800L', 'SIM7600', 'NB_IOT'].includes(sensor.model)) {
             widgets.push(<MetricCard key={`${key}-sig`} icon={<Signal size={24} className="text-black" />} label="Signal" value={formatVal(data.signalStrength, 'dBm')} trend="--" color="emerald" />);
           }
           break;
      }
    });

    return widgets;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 font-['Plus_Jakarta_Sans']">
      
      {/* Top Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Safety Score - White Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex items-center gap-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border border-slate-700 relative z-10 ${
             safetyScore > 80 ? 'bg-emerald-500/10 text-emerald-400' : safetyScore > 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
             {safetyScore > 80 ? <CheckCircle size={40} strokeWidth={1.5} /> : <AlertTriangle size={40} strokeWidth={1.5} />}
          </div>
          <div className="relative z-10">
             <p className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-1">Campus Safety Score</p>
             <div className="flex items-baseline gap-1">
               <span className="text-5xl font-bold text-white">{Math.round(safetyScore)}</span>
               <span className="text-xl font-medium text-slate-500">/100</span>
             </div>
          </div>
        </div>

        {/* AI Status - Black Card */}
        <div className="lg:col-span-8 bg-indigo-600 text-white p-8 rounded-[32px] flex items-center justify-between shadow-xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
               <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <div>
               <p className="text-xs font-bold uppercase text-indigo-200 tracking-widest mb-1">AI Status</p>
               <h3 className="text-2xl font-bold uppercase tracking-tight">System Fully Operational</h3>
            </div>
          </div>
          <div className="flex gap-8 text-right hidden md:flex relative z-10">
             <div>
                <p className="text-[10px] font-bold uppercase text-indigo-200 tracking-wider">Active Nodes</p>
                <p className="text-2xl font-bold">{nodes.length.toString().padStart(2, '0')}</p>
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase text-indigo-200 tracking-wider">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Connectivity Banner / No Signal Area */}
      <div className={`w-full border border-slate-800 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-500 ${
        isHardwareConnected ? 'bg-slate-900' : 'bg-slate-900'
      }`}>
         {/* Background Effects */}
         <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
         {!isHardwareConnected && <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent"></div>}
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
                 isHardwareConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
               }`}>
                  <div className={`w-2 h-2 rounded-full ${isHardwareConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Status: {isHardwareConnected ? 'SYSTEM_ONLINE' : 'NODE_LINK_REQUIRED'}
                  </span>
               </div>
               
               <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white mb-6 leading-[0.9]">
                  {isHardwareConnected ? 'SIGNAL ACTIVE' : <span className="text-slate-700">NO SIGNAL</span>}
               </h1>
               
               <p className="text-sm md:text-base font-medium text-slate-400 uppercase tracking-wide max-w-lg leading-relaxed">
                  {isHardwareConnected 
                    ? "Real-time telemetry stream established. AI risk auditing in progress." 
                    : "Establish a connection to your ESP32 cluster to begin real-time climate monitoring and AI risk auditing."}
               </p>

               {!isHardwareConnected && (
                 <div className="flex flex-wrap gap-4 mt-8">
                    <button onClick={onConnectHardware} disabled={isLinking} className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                       <Usb size={16} /> Link USB
                    </button>
                    <button onClick={onConnectWireless} disabled={isLinking} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                       <Bluetooth size={16} /> BLE Sync
                    </button>
                    <button onClick={onConnectWiFi} disabled={isLinking} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700">
                       <Wifi size={16} /> Wi-Fi Sync
                    </button>
                 </div>
               )}
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 w-full md:w-80 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                     <Activity size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Node Health</span>
                  {!isHardwareConnected && <WifiOff size={20} className="ml-auto text-slate-600" />}
               </div>
               <div className="space-y-3">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                     <div className={`h-full bg-emerald-500 transition-all duration-1000 ${isHardwareConnected ? 'w-[98%]' : 'w-[5%]'}`}></div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-3/4">
                     <div className={`h-full bg-emerald-500 transition-all duration-1000 ${isHardwareConnected ? 'w-[92%]' : 'w-[2%]'}`}></div>
                  </div>
               </div>
               <p className="mt-4 text-[10px] font-bold uppercase text-slate-500 leading-relaxed">
                  {isHardwareConnected ? "All systems nominal. Data stream stable." : "System at idle. Awaiting hardware handshake for organic data stream."}
               </p>
            </div>
         </div>
      </div>

      {/* Node Selector (if multiple) */}
      {nodes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`px-6 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                selectedNodeId === node.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {node.name || `Node ${node.id.substr(0,4)}`}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Radar */}
        <div className="lg:col-span-2 space-y-8">
           {/* Live Metrics Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderSensorWidgets()}
           </div>

           {/* Risk Radar */}
           <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-bold uppercase text-white tracking-tight flex items-center gap-3">
                       <ShieldAlert size={28} className="text-indigo-500" /> Risk Analysis
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Real-time Heuristic Scan</p>
                 </div>
                 <button 
                    onClick={onRefresh}
                    disabled={isRefreshing || data.temperature === 0}
                    className={`p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 ${isRefreshing ? 'animate-spin' : ''}`}
                 >
                    <RefreshCcw size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div className="h-[250px] flex items-center justify-center">
                    <RiskRadar risks={risks} />
                 </div>
                 <div className="space-y-4">
                    {risks.map((risk, i) => (
                       <div key={i} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-600 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className={`w-1.5 h-12 rounded-full ${
                                risk.level === RiskLevel.HIGH ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                                risk.level === RiskLevel.MODERATE ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                             }`}></div>
                             <div>
                                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{risk.type}</p>
                                <p className="text-sm font-medium text-white line-clamp-1">{risk.description}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-bold text-white">{formatVal(risk.score)}%</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Logs & Alerts */}
        <div className="space-y-8">
           {/* Terminal */}
           <div className="bg-black border border-slate-800 rounded-[32px] p-8 shadow-2xl h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                 <Terminal size={100} className="text-emerald-500" />
              </div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 relative z-10">
                 <Terminal size={20} className="text-emerald-500" />
                 <span className="text-xs font-bold uppercase text-emerald-500 tracking-widest">System Console</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs space-y-3 relative z-10">
                 {logs.length > 0 ? logs.map((log, i) => (
                    <div key={i} className="flex gap-4 text-emerald-500/80">
                       <span className="opacity-30 shrink-0">{(logs.length - i).toString().padStart(3, '0')}</span>
                       <span className="break-all">{log}</span>
                    </div>
                 )) : (
                    <div className="text-emerald-900 text-center mt-20 uppercase tracking-widest">Awaiting Input...</div>
                 )}
              </div>
           </div>

           {/* Alert Feed */}
           <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl h-[300px] overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                 <Activity size={20} className="text-indigo-500" />
                 <span className="text-xs font-bold uppercase text-indigo-400 tracking-widest">Live Alerts</span>
              </div>
              <div className="h-full overflow-y-auto custom-scrollbar -mr-2 pr-2">
                 <AlertFeed />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: any;
  label: string;
  value: string;
  trend: string;
  color: 'rose' | 'emerald' | 'indigo';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, trend, color }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-slate-700 transition-all duration-300 group">
       <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl group-hover:scale-110 transition-transform duration-300 text-slate-300">
             {React.cloneElement(icon, { className: "text-white" })}
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
             {trend}
          </span>
       </div>
       <div>
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
       </div>
    </div>
  );
};

export default DashboardView;