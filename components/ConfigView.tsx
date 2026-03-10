import React, { useState } from 'react';
import { Settings, Trash2, Zap, Radio, Database, ShieldCheck, RefreshCcw, Plus, X, Cpu, Save } from 'lucide-react';
import { MapNode, SensorCategory, SensorModel, SensorConfig } from '../types';

interface ConfigViewProps {
  nodes?: MapNode[];
  onUpdateNodes?: (nodes: MapNode[]) => void;
}

const SENSOR_CATALOG: Record<SensorCategory, { model: SensorModel, name: string, desc: string }[]> = {
  THERMAL: [
    { model: 'DHT22', name: 'DHT22', desc: 'Temp & Humidity (High Accuracy)' },
    { model: 'DHT11', name: 'DHT11', desc: 'Temp & Humidity (Basic)' },
    { model: 'DS18B20', name: 'DS18B20', desc: 'Waterproof Temp Probe' },
    { model: 'MLX90614', name: 'MLX90614', desc: 'Infrared Surface Temp' },
  ],
  AIR_QUALITY: [
    { model: 'MQ-135', name: 'MQ-135', desc: 'Air Quality (CO2, NH3)' },
    { model: 'MQ-7', name: 'MQ-7', desc: 'Carbon Monoxide (CO)' },
    { model: 'PMS5003', name: 'PMS5003', desc: 'PM2.5/PM10 Particulates' },
    { model: 'PMS7003', name: 'PMS7003', desc: 'PM2.5/PM10 (Compact)' },
    { model: 'SDS011', name: 'SDS011', desc: 'PM2.5/PM10 (High Precision)' },
    { model: 'MiCS-6814', name: 'MiCS-6814', desc: 'Multi-Gas (CO, NO2, NH3)' },
  ],
  WATER: [
    { model: 'HC-SR04', name: 'HC-SR04', desc: 'Ultrasonic Distance/Level' },
    { model: 'FLOAT_LEVEL', name: 'Float Switch', desc: 'Water Level Trigger' },
    { model: 'CAPACITIVE_SOIL', name: 'Capacitive Soil', desc: 'Soil Moisture' },
    { model: 'RAIN_GAUGE', name: 'Tipping Bucket', desc: 'Rainfall Volume' },
    { model: 'TDS_METER', name: 'TDS Sensor', desc: 'Total Dissolved Solids' },
    { model: 'PH_METER', name: 'pH Sensor', desc: 'Water Acidity' },
    { model: 'TURBIDITY', name: 'Turbidity', desc: 'Water Clarity' },
  ],
  SEISMIC: [
    { model: 'MPU6050', name: 'MPU6050', desc: 'Accel + Gyro (6-Axis)' },
    { model: 'ADXL345', name: 'ADXL345', desc: 'High-Res Accelerometer' },
    { model: 'SW-420', name: 'SW-420', desc: 'Vibration Switch' },
  ],
  ENERGY: [
    { model: 'BH1750', name: 'BH1750', desc: 'Light Intensity (Lux)' },
    { model: 'INA219', name: 'INA219', desc: 'Voltage & Current' },
  ],
  CONNECTIVITY: [
    { model: 'WIFI_BUILTIN', name: 'ESP32 WiFi', desc: 'Standard Wireless' },
    { model: 'SIM800L', name: 'SIM800L', desc: 'GSM/GPRS Cellular' },
    { model: 'SIM7600', name: 'SIM7600', desc: '4G LTE Cellular' },
    { model: 'LORA_RA02', name: 'LoRa Ra-02', desc: 'Long Range Radio' },
    { model: 'NB_IOT', name: 'NB-IoT', desc: 'Narrowband IoT' },
  ],
  DISPLAY: [
    { model: 'TFT_ILI9341', name: 'TFT ILI9341', desc: 'Color LCD Display' }
  ]
};

const ConfigSection = ({ title, icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 border-b border-[#1f263b] pb-2">
      <div className="text-[#5c4dff]">{icon}</div>
      <h3 className="font-outfit font-bold uppercase text-sm tracking-widest text-slate-200">{title}</h3>
    </div>
    <div className="grid grid-cols-1 gap-6">
      {children}
    </div>
  </div>
);

const ConfigToggle = ({ label, desc, active = false }: { label: string, desc: string, active?: boolean }) => (
  <div className="p-6 bg-[#1c2235] border border-[#2d3753] rounded-2xl flex items-center justify-between group hover:border-[#5c4dff] transition-all cursor-pointer">
    <div>
      <p className="font-outfit font-bold uppercase text-xs text-slate-200">{label}</p>
      <p className="font-mono-jb text-[9px] font-medium text-slate-500 uppercase tracking-tight mt-1">{desc}</p>
    </div>
    <div className={`w-12 h-7 ${active ? 'bg-[#5c4dff]' : 'bg-[#2d3753]'} rounded-full relative p-1 transition-colors`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </div>
);

const ConfigView: React.FC<ConfigViewProps> = ({ nodes = [], onUpdateNodes }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes.length > 0 ? nodes[0].id : null);
  const [selectedCategory, setSelectedCategory] = useState<SensorCategory>('THERMAL');
  const [selectedModel, setSelectedModel] = useState<SensorModel>('DHT22');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const clearHistory = () => {
    localStorage.removeItem('geosense_7day_history');
    alert('Local History Purged.');
  };

  const handleAddSensor = () => {
    if (!selectedNode || !onUpdateNodes) return;
    
    const newSensor: SensorConfig = {
      id: Math.random().toString(36).substr(2, 9),
      model: selectedModel,
      category: selectedCategory,
      count: 1,
      isActive: true
    };

    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          sensors: [...(node.sensors || []), newSensor]
        };
      }
      return node;
    });

    onUpdateNodes(updatedNodes);
  };

  const handleRemoveSensor = (sensorId: string) => {
    if (!selectedNode || !onUpdateNodes) return;

    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          sensors: node.sensors.filter(s => s.id !== sensorId)
        };
      }
      return node;
    });

    onUpdateNodes(updatedNodes);
  };

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-200 font-sans p-6 overflow-y-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .font-mono-jb { font-family: 'JetBrains Mono', monospace; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>
      
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: System Settings */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#131724] border border-[#1f263b] p-8 rounded-[32px] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                  <Settings size={24} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="font-outfit text-xl font-bold uppercase tracking-tight text-white">System</h2>
                  <p className="font-mono-jb text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Global_Config</p>
                </div>
              </div>

              <ConfigSection title="Data Strategy" icon={<Database size={16} />}>
                <ConfigToggle label="Auto-Analysis" desc="Trigger Gemini AI every 5m." active />
                <ConfigToggle label="Local Persistence" desc="Save snapshots locally." active />
              </ConfigSection>

              <div className="mt-8 pt-8 border-t border-[#1f263b] space-y-4">
                 <button 
                  onClick={clearHistory}
                  className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl font-outfit font-bold uppercase flex items-center justify-center gap-3 hover:bg-rose-500/20 transition-colors text-xs"
                >
                  <Trash2 size={16} /> Purge History
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Node Configuration */}
          <div className="lg:col-span-8">
            <div className="bg-[#131724] border border-[#1f263b] p-8 lg:p-10 rounded-[32px] shadow-2xl h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#5c4dff]/10 border border-[#5c4dff]/20 rounded-2xl flex items-center justify-center">
                  <Cpu size={24} className="text-[#5c4dff]" />
                </div>
                <div>
                  <h2 className="font-outfit text-xl font-bold uppercase tracking-tight text-white">Node Hardware</h2>
                  <p className="font-mono-jb text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em]">Sensor_Registry_Manager</p>
                </div>
              </div>

              {nodes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#2d3753] rounded-3xl bg-[#1c2235]/30">
                  <p className="font-outfit text-slate-500 font-bold uppercase text-xs tracking-widest">No Nodes Deployed</p>
                  <p className="font-mono-jb text-slate-600 text-[10px] mt-2">Go to Risk Radar map to deploy nodes first.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Node Selector */}
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {nodes.map(node => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`px-6 py-3 rounded-xl border font-outfit font-bold uppercase text-xs whitespace-nowrap transition-all ${
                          selectedNodeId === node.id 
                            ? 'bg-[#5c4dff] border-[#7366ff] text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-[#1c2235] border-[#2d3753] text-slate-400 hover:bg-[#232a40] hover:text-white'
                        }`}
                      >
                        {node.name || `Node ${node.id.substr(0,4)}`}
                      </button>
                    ))}
                  </div>

                  {selectedNode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Attached Sensors List */}
                      <div className="bg-[#1c2235] rounded-3xl p-6 border border-[#2d3753]">
                        <h4 className="font-outfit text-sm font-bold uppercase text-slate-500 mb-4 tracking-widest flex items-center justify-between">
                          Attached Modules <span className="bg-[#2d3753] text-white px-2 py-0.5 rounded text-[9px]">{selectedNode.sensors?.length || 0}</span>
                        </h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {selectedNode.sensors?.map(sensor => (
                            <div key={sensor.id} className="bg-[#131724] border border-[#1f263b] p-4 rounded-xl flex items-center justify-between group hover:border-[#5c4dff] transition-all">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-outfit text-xs font-bold text-slate-200">{sensor.model}</span>
                                  <span className="font-mono-jb text-[8px] font-bold bg-[#0b0e17] text-slate-500 px-1.5 py-0.5 rounded uppercase border border-[#1f263b]">{sensor.category}</span>
                                </div>
                                <p className="font-mono-jb text-[9px] text-slate-500 font-medium mt-1 uppercase">ID: {sensor.id}</p>
                              </div>
                              <button 
                                onClick={() => handleRemoveSensor(sensor.id)}
                                className="text-slate-600 hover:text-rose-400 transition-colors p-2"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          {(!selectedNode.sensors || selectedNode.sensors.length === 0) && (
                            <p className="text-center font-mono-jb text-[10px] text-slate-600 font-bold uppercase py-8">No sensors configured</p>
                          )}
                        </div>
                      </div>

                      {/* Add Sensor Form */}
                      <div className="bg-[#1c2235] rounded-3xl p-6 border border-[#2d3753]">
                        <h4 className="font-outfit text-sm font-bold uppercase text-slate-500 mb-4 tracking-widest">Add Module</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="font-mono-jb text-[9px] font-bold uppercase text-slate-500 mb-2 block">Category</label>
                            <div className="grid grid-cols-2 gap-2">
                              {(Object.keys(SENSOR_CATALOG) as SensorCategory[]).map(cat => (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    setSelectedCategory(cat);
                                    setSelectedModel(SENSOR_CATALOG[cat][0].model);
                                  }}
                                  className={`p-2 rounded-lg font-outfit text-[9px] font-bold uppercase border transition-all ${
                                    selectedCategory === cat 
                                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                      : 'bg-[#131724] border-[#1f263b] text-slate-500 hover:border-[#2d3753] hover:text-slate-300'
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="font-mono-jb text-[9px] font-bold uppercase text-slate-500 mb-2 block">Model</label>
                            <select 
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value as SensorModel)}
                              className="w-full bg-[#131724] border border-[#1f263b] text-slate-200 font-mono-jb text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-[#5c4dff] transition-all"
                            >
                              {SENSOR_CATALOG[selectedCategory].map(s => (
                                <option key={s.model} value={s.model}>
                                  {s.name} - {s.desc}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button 
                            onClick={handleAddSensor}
                            className="w-full bg-[#5c4dff] text-white py-4 rounded-xl font-outfit font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#7366ff] shadow-lg shadow-indigo-500/20 active:translate-y-[1px] transition-all mt-4"
                          >
                            <Plus size={16} /> Install Module
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigView;
