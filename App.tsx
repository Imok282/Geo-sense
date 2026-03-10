
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Terminal,
  User,
  Globe,
  ShieldCheck,
  BookOpen,
  Lock,
  Database,
  FileText,
  Scale,
  Zap,
  Wifi,
  WifiOff,
  Usb,
  Bluetooth,
  Loader2,
  ChevronLeft,
  Settings,
  FlaskConical,
  History,
  Menu,
  X,
  Cpu,
  CircuitBoard,
  MonitorPlay
} from 'lucide-react';
import LoginView from './components/LoginView';
import SetupView from './components/SetupView';
import LandingPage from './components/LandingPage';
import { SensorData, ClimateRisk, RiskLevel, MapNode } from './types';
import { getClimateAnalysis } from './services/geminiService';
import DashboardView from './components/DashboardView';
import StreamsView from './components/StreamsView';
import ConsoleView from './components/ConsoleView';
import SetupGuide from './components/SetupGuide';
import CampusMap from './components/CampusMap';
import ReportView from './components/ReportView';
import SustainabilityLedger from './components/SustainabilityLedger';
import SimulationLab from './components/SimulationLab';
import HistoryView from './components/HistoryView';
import ConfigView from './components/ConfigView';
import HardwareLibrary from './components/HardwareLibrary';
import WiringDiagram from './components/WiringDiagram';
import ProDashboard from './components/ProDashboard';
import { saveDailySnapshot } from './services/historyService';

type ViewType = 'dashboard' | 'metrics' | 'risks' | 'streams' | 'logs' | 'admin' | 'config' | 'setup_guide' | 'reports' | 'ledger' | 'simulation' | 'history' | 'hardware' | 'wiring' | 'pro_dashboard';
type ConnectionStatus = 'idle' | 'requesting' | 'connected' | 'error';
type CommType = 'none' | 'serial' | 'ble' | 'wifi';

const App: React.FC = () => {
  const [hasSeenLanding, setHasSeenLanding] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPassedSetup, setHasPassedSetup] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('idle');
  const [commType, setCommType] = useState<CommType>('none');
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>(["SYS: BOOT_SEQUENCE_COMPLETE", "AI_ENGINE: STANDBY"]);
  const [packets, setPackets] = useState<{id: string, lat: string, value: string}[]>([]);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    aqi: 0,
    rainfall: 0,
    rainStatus: 'None',
    timestamp: '--:--:--',
    waterLevel: 0,
    tds: 0,
    vibration: 0,
    ph: 7,
    turbidity: 0,
    voltage: 0,
    current: 0,
    power: 0,
    lat: 28.6139,
    lng: 77.2090,
    satellites: 0,
    signalStrength: -85
  });

  const [trends, setTrends] = useState<number[]>([]);
  const [climateRisks, setClimateRisks] = useState<ClimateRisk[]>([
    { type: 'Heat Stress', score: 0, level: RiskLevel.SAFE, description: 'Connect hardware node to begin.' },
    { type: 'Air Quality', score: 0, level: RiskLevel.SAFE, description: 'Connect hardware node to begin.' },
    { type: 'Flooding', score: 0, level: RiskLevel.SAFE, description: 'Connect hardware node to begin.' }
  ]);
  const [aiObservation, setAiObservation] = useState("System standby. Awaiting hardware node transmission...");

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const bleCharRef = useRef<any>(null);
  const wifiIntervalRef = useRef<any>(null);
  const keepReading = useRef(true);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  const handleData = useCallback((data: any) => {
    setSensorData(prev => {
      const newData: SensorData = {
        ...prev,
        temperature: data.t || prev.temperature,
        humidity: data.h || prev.humidity,
        aqi: data.a || prev.aqi,
        timestamp: new Date().toLocaleTimeString(),
        rainfall: data.r || 0,
        rainStatus: data.r > 0 ? 'Light' : 'None',
        waterLevel: data.w || prev.waterLevel || 0,
        tds: data.tds || prev.tds || 0,
        vibration: data.v || prev.vibration || 0,
        // New Mappings
        ph: data.ph || prev.ph || 7,
        turbidity: data.tb || prev.turbidity || 0,
        voltage: data.vol || prev.voltage || 0,
        current: data.cur || prev.current || 0,
        power: data.pwr || prev.power || 0,
        lat: data.lat || prev.lat || 28.6139,
        lng: data.lng || prev.lng || 77.2090,
        satellites: data.sat || prev.satellites || 0,
        signalStrength: data.rssi || prev.signalStrength || -85
      };
      saveDailySnapshot(newData);
      return newData;
    });

    setTrends(prev => [...prev.slice(-19), data.a || 0]);
    setPackets(prev => {
      const id = `PKT_0x${Math.floor(Math.random()*65535).toString(16).toUpperCase()}`;
      const lat = (Math.random() * 5 + 1).toFixed(2) + 'ms';
      const value = `${(data.t || 0).toFixed(1)}C / ${Math.round(data.a || 0)}AQI`;
      return [{ id, lat, value }, ...prev].slice(0, 8);
    });
  }, []);

  const fetchAnalysis = useCallback(async (data: SensorData) => {
    if (data.temperature === 0) return;
    setAnalyzing(true);
    addLog("AI_ENGINE: ANALYZING_LIVE_STREAM...");
    try {
      const analysis = await getClimateAnalysis(data);
      setClimateRisks(analysis.risks || []);
      setAiObservation(analysis.recommendations[0] || "Analysis cycle complete.");
      addLog("AI_ENGINE: SUCCESS_LEVEL_SYNCED");
    } catch (error) {
      addLog("AI_ENGINE: SYNC_FAILED");
    } finally {
      setAnalyzing(false);
    }
  }, [addLog]);

  const connectToHardware = useCallback(async () => {
    if (!('serial' in navigator)) {
      addLog("ERR: SERIAL_API_UNSUPPORTED");
      return;
    }
    setConnStatus('requesting');
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setConnStatus('connected');
      setCommType('serial');
      setHasPassedSetup(true);
      addLog("HW_NODE: SERIAL_LINK_ESTABLISHED");

      const decoder = new TextDecoder();
      readerRef.current = port.readable.getReader();
      keepReading.current = true;
      let partialLine = "";

      while (keepReading.current) {
        const { value, done } = await readerRef.current.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        partialLine += chunk;
        const lines = partialLine.split("\n");
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
              const data = JSON.parse(trimmed);
              handleData(data);
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setConnStatus('error');
      addLog("SYS: SERIAL_CANCELLED");
    }
  }, [handleData, addLog]);

  const connectToHardwareBluetooth = useCallback(async () => {
    if (!('bluetooth' in navigator)) {
      addLog("ERR: BLUETOOTH_API_UNSUPPORTED");
      return;
    }
    setConnStatus('requesting');
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'GEOSENSE' }],
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
      const characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
      
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = new TextDecoder().decode(event.target.value);
        try {
          const data = JSON.parse(value);
          handleData(data);
        } catch(e) {}
      });

      bleCharRef.current = characteristic;
      setConnStatus('connected');
      setCommType('ble');
      setHasPassedSetup(true);
      addLog("HW_NODE: BLE_SYNC_OK");
    } catch (err) {
      setConnStatus('error');
      addLog("SYS: BLE_SYNC_CANCELLED");
    }
  }, [handleData, addLog]);

  const connectToWifiNode = useCallback(async () => {
    setConnStatus('requesting');
    addLog("SYS: POLLING_HOTSPOT_192.168.4.1...");
    
    // Attempt an initial fetch to verify the hotspot is active
    try {
      const test = await fetch('http://192.168.4.1/telemetry');
      if (test.ok) {
        setConnStatus('connected');
        setCommType('wifi');
        setHasPassedSetup(true);
        addLog("HW_NODE: WIFI_GATEWAY_LINKED");
        
        // Start polling interval
        wifiIntervalRef.current = setInterval(async () => {
          try {
            const resp = await fetch('http://192.168.4.1/telemetry');
            const json = await resp.json();
            handleData(json);
          } catch (e) {
            addLog("WIFI_ERR: GATEWAY_LOST");
            setConnStatus('error');
            if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
          }
        }, 5000);
      }
    } catch (e) {
      setConnStatus('error');
      addLog("SYS: HOTSPOT_UNREACHABLE_TIMEOUT");
    }
  }, [handleData, addLog]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => addLog("SYS: LOCATION_ACCESS_FAIL")
    );
    return () => { 
      keepReading.current = false; 
      if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
    };
  }, [addLog]);

  if (!hasSeenLanding) return <LandingPage onContinue={() => setHasSeenLanding(true)} />;
  if (!isLoggedIn) return <LoginView onLogin={setIsLoggedIn} />;
  
  if (!hasPassedSetup && connStatus !== 'connected') {
    return (
      <SetupView 
        onLink={connectToHardware} 
        onLinkBLE={connectToHardwareBluetooth}
        onLinkWiFi={connectToWifiNode}
        onSkip={() => setHasPassedSetup(true)} 
        isLoading={connStatus === 'requesting'} 
      />
    );
  }

  const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer py-3 px-4 mx-2 rounded-xl transition-all duration-200 group border ${active ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={18} className={active ? 'stroke-[2.5px]' : 'stroke-2 group-hover:scale-110 transition-transform'} />
      {isSidebarOpen && (
        <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
      )}
    </div>
  );

  const dataHeavyViews: ViewType[] = ['ledger', 'metrics', 'risks', 'streams', 'reports', 'pro_dashboard'];
  const isViewLocked = dataHeavyViews.includes(view) && connStatus !== 'connected';

  const ConnectionPromptOverlay = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[32px] shadow-2xl text-center max-w-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/10 animate-pulse">
             <Zap size={40} className="text-indigo-400" />
          </div>
          <h3 className="text-3xl font-bold uppercase tracking-tight mb-4 text-white">Signal Required</h3>
          <p className="text-sm font-medium text-slate-400 leading-relaxed mb-10 uppercase tracking-wide">
            This module requires active telemetry. Initialize hardware handshake to proceed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={connectToHardware} className="flex-1 bg-white text-black py-4 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
               <Usb size={16} /> USB Link
            </button>
            <button onClick={connectToHardwareBluetooth} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
               <Bluetooth size={16} /> BLE Sync
            </button>
            <button onClick={connectToWifiNode} className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors border border-slate-700">
               <Wifi size={16} /> Wi-Fi
            </button>
          </div>
          <button onClick={() => setView('dashboard')} className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Return to Dashboard</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 font-['Plus_Jakarta_Sans'] text-slate-200 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col py-6 shrink-0 z-30 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out`}>
        <div className="mb-8 px-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Globe size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-sm font-bold uppercase tracking-wider text-white leading-none">GeoSense</h1>
                <span className="text-[10px] font-medium text-slate-400 tracking-widest">VER 2.0</span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
              <Globe size={18} />
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`text-slate-500 hover:text-white transition-colors ${!isSidebarOpen && 'hidden'}`}>
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="flex-1 w-full space-y-1 overflow-y-auto custom-scrollbar px-2">
          <div className={`px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${!isSidebarOpen && 'hidden'}`}>Main Module</div>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem icon={MonitorPlay} label="Pro Dashboard" active={view === 'pro_dashboard'} onClick={() => setView('pro_dashboard')} />
          <SidebarItem icon={ShieldAlert} label="Risk Radar" active={view === 'risks'} onClick={() => setView('risks')} />
          <SidebarItem icon={Activity} label="Live Streams" active={view === 'streams'} onClick={() => setView('streams')} />
          <SidebarItem icon={Terminal} label="Metrics" active={view === 'metrics'} onClick={() => setView('metrics')} />
          
          <div className={`px-4 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${!isSidebarOpen && 'hidden'}`}>Analysis</div>
          <SidebarItem icon={FlaskConical} label="Sim Lab" active={view === 'simulation'} onClick={() => setView('simulation')} />
          <SidebarItem icon={Scale} label="Ledger" active={view === 'ledger'} onClick={() => setView('ledger')} />
          <SidebarItem icon={FileText} label="Reports" active={view === 'reports'} onClick={() => setView('reports')} />
          <SidebarItem icon={History} label="Archives" active={view === 'history'} onClick={() => setView('history')} />
          
          <div className={`px-4 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${!isSidebarOpen && 'hidden'}`}>System</div>
          <SidebarItem icon={Terminal} label="System Logs" active={view === 'logs'} onClick={() => setView('logs')} />
          <SidebarItem icon={Cpu} label="Hardware" active={view === 'hardware'} onClick={() => setView('hardware')} />
          <SidebarItem icon={CircuitBoard} label="Wiring" active={view === 'wiring'} onClick={() => setView('wiring')} />
          <SidebarItem icon={Settings} label="Config" active={view === 'config'} onClick={() => setView('config')} />
        </div>

        <div className="mt-auto px-4 pt-4 border-t border-slate-800">
           <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700 ${!isSidebarOpen && 'justify-center'}`}>
              <div className={`w-2 h-2 rounded-full ${connStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'} animate-pulse`}></div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">System Status</span>
                  <span className={`text-[10px] font-bold uppercase ${connStatus === 'connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {connStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 shrink-0 z-20">
           <div className="flex items-center gap-4">
             {!isSidebarOpen && (
               <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white">
                 <Menu size={24} strokeWidth={2.5} />
               </button>
             )}
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center">
                   <ChevronLeft size={20} className="text-slate-400" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                  {view.replace('_', ' ')}
                </h2>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
                <Globe size={14} className="text-indigo-400" />
                <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider">
                  {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'LOCATING...'}
                </span>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20">
               OP
             </div>
           </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 relative">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            {isViewLocked ? <ConnectionPromptOverlay /> : (
              <>
                {view === 'dashboard' && (
                  <DashboardView 
                    data={sensorData} risks={climateRisks} logs={logs} 
                    onRefresh={() => fetchAnalysis(sensorData)} isRefreshing={analyzing}
                    isHardwareConnected={connStatus === 'connected'}
                    onConnectHardware={connectToHardware} onConnectWireless={connectToHardwareBluetooth}
                    onConnectWiFi={connectToWifiNode}
                    isLinking={connStatus === 'requesting'}
                    nodes={nodes}
                  />
                )}
                {view === 'pro_dashboard' && <ProDashboard data={sensorData} />}
                {view === 'streams' && <StreamsView trends={trends} aqi={sensorData.aqi} packets={packets} observation={aiObservation} />}
                {view === 'ledger' && <SustainabilityLedger sensorData={sensorData} />}
                {view === 'metrics' && <ConsoleView temperature={sensorData.temperature} humidity={sensorData.humidity} aqi={sensorData.aqi} />}
                {view === 'setup_guide' && <SetupGuide onBack={() => setView('dashboard')} />}
                {view === 'reports' && <ReportView onBack={() => setView('dashboard')} sensorData={sensorData} nodes={nodes} />}
                {view === 'simulation' && <SimulationLab />}
                {view === 'history' && <HistoryView />}
                {view === 'hardware' && <HardwareLibrary />}
                {view === 'wiring' && <WiringDiagram />}
                {view === 'risks' && (
                  <div className="h-[80vh] min-h-[600px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                    <CampusMap latitude={coords?.lat || 28.6139} longitude={coords?.lng || 77.2090} currentSensorData={sensorData} nodes={nodes} setNodes={setNodes} />
                  </div>
                )}
                {view === 'logs' && (
                  <div className="h-[80vh] min-h-[600px] bg-slate-900 rounded-3xl border border-slate-800 p-6 font-mono text-[11px] text-emerald-500 overflow-y-auto custom-scrollbar shadow-2xl">
                    {logs.map((log, i) => <div key={i} className="flex gap-4 opacity-70 mb-2 border-b border-emerald-900/10 pb-1"><span className="text-emerald-800 shrink-0">{(logs.length - i).toString().padStart(3, '0')}</span>{log}</div>)}
                  </div>
                )}
                {view === 'admin' || view === 'config' ? <ConfigView nodes={nodes} onUpdateNodes={setNodes} /> : null}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
