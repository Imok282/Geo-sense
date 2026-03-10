import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI } from "@google/genai";
import { 
  ShieldAlert, 
  Loader2, 
  Trash2, 
  Plus, 
  Navigation, 
  ExternalLink, 
  Zap,
  Info,
  Map as MapIcon,
  Target,
  ShieldCheck
} from 'lucide-react';
import { RiskLevel, SensorData, MapNode, NodeAnalysis, SensorModel, SensorCategory, SensorConfig } from '../types';
import { HARDWARE_CATALOG } from './hardwareData';

interface CampusMapProps {
  latitude: number;
  longitude: number;
  currentSensorData?: SensorData;
  nodes: MapNode[];
  setNodes: React.Dispatch<React.SetStateAction<MapNode[]>>;
}

// --- Helper Functions ---

const normalizeLevel = (level?: string): RiskLevel => {
  if (!level) return RiskLevel.SAFE;
  const l = level.toUpperCase();
  if (l.includes('HIGH') || l.includes('CRITICAL') || l.includes('DANGER')) return RiskLevel.HIGH;
  if (l.includes('MODERATE') || l.includes('WARNING') || l.includes('CAUTION')) return RiskLevel.MODERATE;
  return RiskLevel.SAFE;
};

const mapHardwareIdToModel = (id: string): SensorModel => {
  const map: Record<string, SensorModel> = {
    'dht22': 'DHT22',
    'ds18b20': 'DS18B20',
    'mlx90614': 'MLX90614',
    'mq135': 'MQ-135',
    'mq7': 'MQ-7',
    'pms5003': 'PMS5003',
    'sds011': 'SDS011',
    'mics6814': 'MiCS-6814',
    'hcsr04': 'HC-SR04',
    'float': 'FLOAT_LEVEL',
    'soil': 'CAPACITIVE_SOIL',
    'rain': 'RAIN_GAUGE',
    'mpu6050': 'MPU6050',
    'adxl345': 'ADXL345',
    'sw420': 'SW-420',
    'bh1750': 'BH1750',
    'ina219': 'INA219',
    'tds': 'TDS_METER',
    'ph': 'PH_METER',
    'turbidity': 'TURBIDITY',
    'wifi': 'WIFI_BUILTIN',
    'gsm': 'SIM800L',
    'lora': 'LORA_RA02',
    'nbiot': 'NB_IOT'
  };
  return map[id] || 'DHT22';
};

const mapHardwareIdToCategory = (id: string): SensorCategory => {
   const cat = HARDWARE_CATALOG.find(c => c.sensors.some(s => s.id === id));
   if (cat) {
     switch(cat.id) {
       case 'temp': return 'THERMAL';
       case 'air': return 'AIR_QUALITY';
       case 'water': return 'WATER';
       case 'seismic': return 'SEISMIC';
       case 'energy': return 'ENERGY';
       case 'connect': return 'CONNECTIVITY';
       case 'quality': return 'WATER';
       default: return 'THERMAL';
     }
   }
   return 'THERMAL';
};

// Cache for custom icons to prevent recreation on every render
const iconCache = new Map<string, L.DivIcon>();

const createCustomIcon = (riskScore: number, isSelected: boolean, sensorCategory?: string) => {
  const cacheKey = `${riskScore}-${isSelected}-${sensorCategory}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  let colorClass = 'bg-indigo-500';
  let pulseClass = 'bg-indigo-400';
  
  if (sensorCategory) {
    const category = HARDWARE_CATALOG.find(c => c.id === sensorCategory);
    if (category) {
      // Map tailwind classes to hex colors for inline styles if needed, 
      // but here we use the class in the HTML string.
      // However, L.divIcon html string needs actual styles or global classes.
      // We will use the tailwind classes directly in the className of the div.
      colorClass = category.color;
      pulseClass = category.color.replace('500', '400');
    }
  } else {
    if (riskScore > 75) {
      colorClass = 'bg-rose-500';
      pulseClass = 'bg-rose-400';
    } else if (riskScore > 40) {
      colorClass = 'bg-amber-500';
      pulseClass = 'bg-amber-400';
    } else {
      colorClass = 'bg-emerald-500';
      pulseClass = 'bg-emerald-400';
    }
  }

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center w-full h-full">
        <div class="absolute -inset-2 ${pulseClass} opacity-30 rounded-none animate-ping"></div>
        <div class="w-5 h-5 ${colorClass} border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-transform ${isSelected ? 'scale-125' : ''}">
          ${isSelected ? '<div class="w-1.5 h-1.5 bg-white border border-black"></div>' : ''}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

// --- Sub-Components ---

const MapController = React.memo(({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
});

const MapClickHandler = React.memo(({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
});

const MemoizedMap = React.memo(({ 
  latitude, 
  longitude, 
  nodes, 
  deployNode,
  setMap,
  selectedNodeId,
  setSelectedNodeId
}: { 
  latitude: number, 
  longitude: number, 
  nodes: MapNode[], 
  deployNode: (lat: number, lng: number) => void,
  setMap: (map: L.Map) => void,
  selectedNodeId: string | null,
  setSelectedNodeId: (id: string | null) => void
}) => {
  return (
    <MapContainer 
      ref={setMap}
      center={[latitude, longitude]} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapClickHandler onMapClick={deployNode} />
      <MapController lat={latitude} lng={longitude} />

      {/* User Location Marker */}
      <Marker position={[latitude, longitude]} icon={L.divIcon({
        className: 'user-marker',
        html: `<div style="background-color: #10b981; width: 24px; height: 24px; border: 3px solid #000000; box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);"></div>`,
        iconSize: [24, 24]
      })}>
        <Popup className="custom-popup">
           <div className="text-center font-black uppercase text-xs p-2 text-black">HQ / Current Location</div>
        </Popup>
      </Marker>

      {/* Risk Circles */}
      {nodes.map(node => node.analysis && (
        <Circle
          key={`circle-${node.id}`}
          center={[node.lat, node.lng]}
          radius={100 + (node.analysis.score * 2)}
          pathOptions={{
            fillColor: node.analysis.threatLevel === RiskLevel.HIGH ? '#f43f5e' :
                      node.analysis.threatLevel === RiskLevel.MODERATE ? '#fbbf24' : '#10b981',
            color: node.analysis.threatLevel === RiskLevel.HIGH ? '#f43f5e' :
                   node.analysis.threatLevel === RiskLevel.MODERATE ? '#fbbf24' : '#10b981',
            weight: 2,
            fillOpacity: 0.1,
            dashArray: '5, 5'
          }}
        />
      ))}

      {/* Active Nodes */}
      {nodes.map(node => (
        <Marker 
          key={node.id} 
          position={[node.lat, node.lng]} 
          icon={createCustomIcon(node.analysis?.score || 0, selectedNodeId === node.id, node.sensorCategory)}
          eventHandlers={{
            click: () => setSelectedNodeId(node.id)
          }}
        >
          <Popup offset={[0, -10]} className="custom-popup">
            <div className="p-1 w-60 font-['Plus_Jakarta_Sans']">
              <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-black/5">
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-wider text-black">
                    {node.sensorType ? HARDWARE_CATALOG.flatMap(c => c.sensors).find(s => s.id === node.sensorType)?.name : `NODE ${node.id.split('_')[1]}`}
                  </h3>
                  <span className="text-[8px] font-bold text-slate-500">{node.id}</span>
                </div>
                {node.analysis && <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{node.analysis.score}% RISK</span>}
              </div>

              {node.data && (
                <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b-2 border-black/5">
                  {/* Common Fields or Specific based on type */}
                  {(node.sensorType === 'dht22' || !node.sensorType) && (
                    <>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Temp</span>
                        <span className="block text-xs font-black text-black">{node.data.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Humidity</span>
                        <span className="block text-xs font-black text-black">{node.data.humidity.toFixed(0)}%</span>
                      </div>
                    </>
                  )}

                  {node.sensorType === 'ds18b20' && (
                    <div className="bg-slate-50 p-1.5 rounded border border-black/5 col-span-2">
                      <span className="block text-[8px] font-black text-slate-400 uppercase">Soil/Water Temp</span>
                      <span className="block text-xs font-black text-black">{node.data.temperature.toFixed(2)}°C</span>
                    </div>
                  )}

                  {node.sensorType === 'mlx90614' && (
                    <>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Ambient</span>
                        <span className="block text-xs font-black text-black">{node.data.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="bg-amber-50 p-1.5 rounded border border-amber-100">
                        <span className="block text-[8px] font-black text-amber-600 uppercase">Surface</span>
                        <span className="block text-xs font-black text-amber-500">{node.data.surfaceTemp?.toFixed(1)}°C</span>
                      </div>
                    </>
                  )}

                  {node.sensorType === 'mq135' && (
                    <>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">AQI</span>
                        <span className="block text-xs font-black text-black">{Math.round(node.data.aqi)}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">CO2</span>
                        <span className="block text-xs font-black text-black">{Math.round(node.data.co2 || 0)} ppm</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Benzene</span>
                        <span className="block text-xs font-black text-black">{node.data.benzene?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">Ammonia</span>
                        <span className="block text-xs font-black text-black">{node.data.ammonia?.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {node.sensorType === 'mq7' && (
                    <div className="bg-rose-50 p-1.5 rounded border border-rose-100 col-span-2">
                      <span className="block text-[8px] font-black text-rose-500 uppercase">Carbon Monoxide (CO)</span>
                      <span className="block text-xs font-black text-rose-400">{node.data.co?.toFixed(1)} ppm</span>
                    </div>
                  )}

                  {(node.sensorType === 'pms5003' || node.sensorType === 'sds011') && (
                    <>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">PM 2.5</span>
                        <span className="block text-xs font-black text-black">{node.data.pm25?.toFixed(1)}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-black/5">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">PM 10</span>
                        <span className="block text-xs font-black text-black">{node.data.pm10?.toFixed(1)}</span>
                      </div>
                    </>
                  )}

                  {node.sensorCategory === 'water' && (
                     <div className="bg-blue-50 p-1.5 rounded border border-blue-100 col-span-2">
                      <span className="block text-[8px] font-black text-blue-500 uppercase">Water Level</span>
                      <span className="block text-xs font-black text-blue-400">{node.data.waterLevel?.toFixed(1)} cm</span>
                    </div>
                  )}
                  {node.sensorCategory === 'seismic' && (
                     <div className="bg-amber-50 p-1.5 rounded border border-amber-100 col-span-2">
                      <span className="block text-[8px] font-black text-amber-500 uppercase">Vibration</span>
                      <span className="block text-xs font-black text-amber-400">{node.data.vibration?.toFixed(3)} g</span>
                    </div>
                  )}
                </div>
              )}
              
              {node.loading ? (
                <div className="flex flex-col items-center py-6 gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <p className="text-[9px] font-black uppercase tracking-widest animate-pulse text-indigo-600">Analyzing Terrain...</p>
                </div>
              ) : node.analysis ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border-2 border-black/5 text-white shadow-sm ${
                      node.analysis.threatLevel === RiskLevel.HIGH ? 'bg-rose-500' :
                      node.analysis.threatLevel === RiskLevel.MODERATE ? 'bg-amber-400 text-black' : 'bg-emerald-500'
                    }`}>
                       {node.analysis.threatLevel === RiskLevel.HIGH && <ShieldAlert size={18} />}
                       {node.analysis.threatLevel === RiskLevel.MODERATE && <Info size={18} />}
                       {node.analysis.threatLevel === RiskLevel.SAFE && <ShieldCheck size={18} />}
                    </div>
                    <h5 className={`text-lg font-black uppercase tracking-tighter ${
                      node.analysis.threatLevel === RiskLevel.HIGH ? 'text-rose-600' :
                      node.analysis.threatLevel === RiskLevel.MODERATE ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {node.analysis.threatLevel}
                    </h5>
                  </div>
                  
                  <p className="text-[10px] font-bold text-black leading-relaxed bg-slate-50 p-2 rounded-lg border border-black/5">
                    {node.analysis.summary}
                  </p>

                  {node.analysis.sources.length > 0 && (
                    <div className="pt-2">
                       <div className="flex items-center gap-1.5 mb-2">
                          <Zap size={10} className="text-amber-500 fill-amber-500" />
                          <span className="text-[8px] font-black uppercase text-slate-400">Grounding Sources</span>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         {node.analysis.sources.slice(0, 2).map((s, i) => (
                           <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-200 transition-colors">
                             <span className="text-[8px] font-black uppercase truncate max-w-[80px] text-slate-700">{s.title}</span>
                             <ExternalLink size={8} className="text-slate-500" />
                           </a>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                   <p className="text-xs text-rose-500 font-black uppercase mb-1">Sync Error</p>
                   <p className="text-[9px] text-slate-400 font-bold">AI service unreachable</p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

const CampusMap: React.FC<CampusMapProps> = ({ latitude, longitude, currentSensorData, nodes, setNodes }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('dht22'); // Default to DHT22
  const [showSensorPalette, setShowSensorPalette] = useState(true);
  
  const sensorDataRef = React.useRef(currentSensorData);

  React.useEffect(() => {
    sensorDataRef.current = currentSensorData;
  }, [currentSensorData]);

  const analyzeCoordinates = useCallback(async (nodeId: string, lat: number, lng: number, nodeData: SensorData, sensorType?: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      let sensorContext = '';
      if (sensorType) {
        const sensor = HARDWARE_CATALOG.flatMap(c => c.sensors).find(s => s.id === sensorType);
        if (sensor) {
          sensorContext = `Sensor Type: ${sensor.name} (${sensor.description}). Use Case: ${sensor.useCase}.`;
        }
      }

      const prompt = `Analyze environmental climate risks for a school campus at precise coordinates ${lat}, ${lng}. 
      Contextual Sensor Readings: Temperature ${nodeData.temperature.toFixed(1)}°C, AQI ${Math.round(nodeData.aqi)}. 
      ${sensorContext}
      
      Tasks:
      1. Use Google Maps Grounding to identify nearby risk factors (factories, highways, bodies of water, density).
      2. Assess specific threats: Heat Island effect, Pollution exposure, Flood susceptibility.
      
      Output Rules:
      - Provide a short summary (max 20 words).
      - Determine THREAT_LEVEL (SAFE, MODERATE, HIGH).
      - Assign a Risk Score (0-100).
      
      At the end of the text, STRICTLY append:
      THREAT_LEVEL: [LEVEL]
      SCORE: [NUMBER]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
          }
        }
      });

      const responseText = response.text || "";
      const threatLevelMatch = responseText.match(/THREAT_LEVEL:\s*(SAFE|MODERATE|HIGH)/i);
      const scoreMatch = responseText.match(/SCORE:\s*(\d+)/);
      
      // Extract Google Maps Grounding Sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          title: c.maps?.title || "Unknown Location",
          uri: c.maps?.uri || "#"
        }));

      const analysis: NodeAnalysis = {
        summary: responseText.replace(/THREAT_LEVEL:.*|SCORE:.*/gis, '').split('.')[0] + '.',
        threatLevel: normalizeLevel(threatLevelMatch?.[1]),
        score: parseInt(scoreMatch?.[1] || '50', 10),
        sources: sources
      };

      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, loading: false, analysis, error: null } : n));
    } catch (e) {
      console.error("Coordinate analysis failed", e);
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, loading: false, error: "AI Connection Failed" } : n));
    }
  }, [setNodes]);

  const deployNode = useCallback((lat: number, lng: number) => {
    const id = `NODE_${Date.now()}`;
    const baseData = sensorDataRef.current || { temperature: 25, humidity: 50, aqi: 40, rainfall: 0, rainStatus: 'None', timestamp: new Date().toLocaleTimeString() };
    
    // Add slight variance to simulate localized readings
    const variance = (Math.random() - 0.5) * 5;
    
    // Base random values
    let nodeData: SensorData = {
      ...baseData,
      temperature: baseData.temperature + variance,
      aqi: Math.max(0, baseData.aqi + variance * 2),
      humidity: Math.max(0, Math.min(100, baseData.humidity + variance)),
      timestamp: new Date().toLocaleTimeString()
    };

    // Generate specific data based on sensor type
    if (selectedSensorId === 'dht22') {
       // Standard temp/humidity already set
    } else if (selectedSensorId === 'ds18b20') {
       // High precision temp, maybe slightly cooler if soil
       nodeData.temperature = baseData.temperature - 2 + variance; 
    } else if (selectedSensorId === 'mlx90614') {
       nodeData.surfaceTemp = baseData.temperature + 5 + variance; // Surface often hotter
    } else if (selectedSensorId === 'mq135') {
       nodeData.co2 = 400 + Math.random() * 200;
       nodeData.ammonia = Math.random() * 10;
       nodeData.benzene = Math.random() * 5;
       nodeData.aqi = baseData.aqi + variance * 3;
    } else if (selectedSensorId === 'mq7') {
       nodeData.co = Math.random() * 50;
    } else if (selectedSensorId === 'pms5003' || selectedSensorId === 'sds011') {
       nodeData.pm25 = 10 + Math.random() * 20;
       nodeData.pm10 = 20 + Math.random() * 30;
       nodeData.aqi = baseData.aqi + variance * 2;
    } else {
       // Default randoms for others
       nodeData.waterLevel = Math.random() * 100;
       nodeData.vibration = Math.random() * 2;
       nodeData.sound = 40 + Math.random() * 40;
       nodeData.luminosity = 500 + Math.random() * 500;
       nodeData.voc = Math.random() * 50;
    }

    // Find selected sensor details
    const sensor = HARDWARE_CATALOG.flatMap(c => c.sensors).find(s => s.id === selectedSensorId);
    const category = HARDWARE_CATALOG.find(c => c.sensors.some(s => s.id === selectedSensorId));

    // Create SensorConfig
    const sensorConfig: SensorConfig = {
      id: Math.random().toString(36).substr(2, 9),
      model: mapHardwareIdToModel(selectedSensorId),
      category: mapHardwareIdToCategory(selectedSensorId),
      count: 1,
      isActive: true
    };

    const newNode: MapNode = { 
      id, 
      lat, 
      lng, 
      loading: true, 
      analysis: null, 
      error: null, 
      data: nodeData,
      sensorType: selectedSensorId,
      sensorCategory: category?.id,
      sensors: [sensorConfig]
    };
    setNodes(prev => [...prev, newNode]);
    analyzeCoordinates(id, lat, lng, nodeData, selectedSensorId);
  }, [analyzeCoordinates, setNodes, selectedSensorId]);

  const removeNode = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNodes(prev => prev.filter(n => n.id !== id));
  }, [setNodes]);

  const handleRecenter = useCallback(() => {
    if (map) {
      map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
    }
  }, [map, latitude, longitude]);

  return (
    <div className="relative h-full w-full bg-slate-900 overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* HUD: Active Nodes Sidebar */}
      <div className="absolute top-6 left-6 z-[1000] w-[320px] flex flex-col gap-4 no-print pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-5 rounded-[24px] shadow-2xl pointer-events-auto max-h-[50vh] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-bold uppercase text-xs tracking-widest flex items-center gap-2 text-white">
              <Navigation size={16} className="text-indigo-400" /> Active Sensors
            </h3>
            <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[9px] font-bold">{nodes.length} Active</div>
          </div>

          <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {nodes.length === 0 ? (
              <div className="py-8 text-center bg-slate-800/50 border border-slate-700 border-dashed rounded-[20px]">
                <Target size={24} className="mx-auto mb-2 text-slate-500" />
                <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Tap map to deploy</p>
              </div>
            ) : (
              nodes.map(node => (
                <div key={node.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-2xl relative group animate-in slide-in-from-left-4 duration-300 hover:bg-slate-800 hover:border-slate-600 transition-all">
                  <button onClick={(e) => removeNode(node.id, e)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors z-10">
                    <Trash2 size={12} />
                  </button>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] text-slate-400 font-bold">
                      {node.lat.toFixed(4)}, {node.lng.toFixed(4)}
                    </span>
                    {node.loading && <Loader2 className="animate-spin text-indigo-400" size={12} />}
                  </div>
                  {node.data && (
                    <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-slate-300">
                      {(node.sensorType === 'dht22' || !node.sensorType) && (
                        <>
                          <span>{node.data.temperature.toFixed(1)}°C</span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                          <span>{node.data.humidity.toFixed(0)}%</span>
                        </>
                      )}
                      {node.sensorType === 'ds18b20' && <span>{node.data.temperature.toFixed(2)}°C</span>}
                      {node.sensorType === 'mlx90614' && (
                         <>
                           <span>Amb: {node.data.temperature.toFixed(1)}°C</span>
                           <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                           <span className="text-amber-400">Surf: {node.data.surfaceTemp?.toFixed(1)}°C</span>
                         </>
                      )}
                      {node.sensorType === 'mq135' && (
                        <>
                          <span>AQI: {Math.round(node.data.aqi)}</span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                          <span>CO2: {Math.round(node.data.co2 || 0)}</span>
                        </>
                      )}
                      {node.sensorType === 'mq7' && <span className="text-rose-400">CO: {node.data.co?.toFixed(1)} ppm</span>}
                      {(node.sensorType === 'pms5003' || node.sensorType === 'sds011') && (
                        <>
                          <span>PM2.5: {node.data.pm25?.toFixed(1)}</span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                          <span>PM10: {node.data.pm10?.toFixed(1)}</span>
                        </>
                      )}
                      {node.sensorCategory === 'water' && <span className="text-blue-400">Lvl: {node.data.waterLevel?.toFixed(1)} cm</span>}
                      {node.sensorCategory === 'seismic' && <span className="text-amber-400">Vib: {node.data.vibration?.toFixed(3)} g</span>}
                    </div>
                  )}
                  {node.analysis ? (
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${
                        node.analysis.threatLevel === RiskLevel.HIGH ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        node.analysis.threatLevel === RiskLevel.MODERATE ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          node.analysis.threatLevel === RiskLevel.HIGH ? 'bg-rose-500' :
                          node.analysis.threatLevel === RiskLevel.MODERATE ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>
                        <span className="text-[8px] font-bold uppercase">{node.analysis.threatLevel}</span>
                      </div>
                      <span className="font-bold text-[10px] text-white">{node.analysis.score}%</span>
                    </div>
                  ) : (
                    <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute top-6 right-6 z-[1000] no-print pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-[24px] shadow-2xl pointer-events-auto">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-700 pb-2">Risk Levels</h4>
          <div className="space-y-2">
            <LegendItem color="#10b981" label="Optimal" />
            <LegendItem color="#fbbf24" label="Monitor Required" />
            <LegendItem color="#f43f5e" label="Critical Threat" />
          </div>
        </div>
      </div>

      <MemoizedMap 
        latitude={latitude} 
        longitude={longitude} 
        nodes={nodes} 
        deployNode={deployNode} 
        setMap={setMap}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
      />

      {/* Control: Recenter */}
      <div className="absolute bottom-6 left-6 z-[1000] no-print">
        <button 
          onClick={handleRecenter}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-[24px] shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3 group"
        >
          <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
             <MapIcon size={20} />
          </div>
          <div className="text-left hidden md:block">
             <span className="block text-[8px] font-bold uppercase text-slate-400 tracking-widest">Return to</span>
             <span className="block text-xs font-bold uppercase text-white">Base Station</span>
          </div>
        </button>
      </div>

      {/* Sensor Palette */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end gap-4 pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-[24px] p-3 shadow-2xl flex flex-col gap-2 transition-all duration-300 pointer-events-auto max-w-[90vw] md:max-w-[600px]">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Zap size={12} className="text-amber-500" /> Deploy Sensor Node
            </span>
            <button onClick={() => setShowSensorPalette(!showSensorPalette)} className="text-[10px] font-bold underline text-slate-500 hover:text-white">
              {showSensorPalette ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showSensorPalette && (
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="flex gap-2 w-max px-1">
                {HARDWARE_CATALOG.map(category => (
                  <div key={category.id} className="flex gap-1 p-1 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    {category.sensors.map(sensor => (
                      <button
                        key={sensor.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSensorId(sensor.id);
                        }}
                        className={`group relative p-2 rounded-xl border transition-all flex flex-col items-center gap-1 min-w-[60px] ${
                          selectedSensorId === sensor.id 
                            ? `border-indigo-500 ${category.color.replace('bg-', 'bg-opacity-20 bg-')} text-white shadow-lg shadow-indigo-500/10` 
                            : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title={sensor.name}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                           {/* Simple circle indicator */}
                           <div className={`w-2 h-2 rounded-full ${selectedSensorId === sensor.id ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-slate-600'}`}></div>
                        </div>
                        <span className="text-[8px] font-bold uppercase max-w-[50px] truncate">{sensor.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: color }}></div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{label}</span>
  </div>
);

export default CampusMap;