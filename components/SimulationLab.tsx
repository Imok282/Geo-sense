import React, { useState } from 'react';
import { 
  FlaskConical, 
  Thermometer, 
  Wind, 
  Droplets, 
  Zap, 
  Play, 
  RefreshCcw, 
  ShieldAlert, 
  Info,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel } from '../types';

interface SimulationResult {
  summary: string;
  risks: { type: string; score: number; level: RiskLevel; impact: string }[];
  mitigation: string[];
}

const SimulationLab: React.FC = () => {
  const [temp, setTemp] = useState(35);
  const [humidity, setHumidity] = useState(60);
  const [aqi, setAqi] = useState(120);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Act as an environmental risk simulator. 
    Analyze a hypothetical "What-If" scenario for a school campus with these parameters:
    - Temperature: ${temp}°C
    - Humidity: ${humidity}%
    - AQI: ${aqi}
    
    Predict the environmental impact and risks.
    Output a JSON object:
    {
      "summary": "A 20-word executive summary of the scenario.",
      "risks": [
        { "type": "Heat Stress", "score": 0-100, "level": "SAFE/MODERATE/HIGH", "impact": "Short description of impact" },
        { "type": "Air Quality", "score": 0-100, "level": "SAFE/MODERATE/HIGH", "impact": "Short description of impact" },
        { "type": "Operational Risk", "score": 0-100, "level": "SAFE/MODERATE/HIGH", "impact": "Short description of impact" }
      ],
      "mitigation": ["3 specific steps to prepare for this scenario"]
    }`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    level: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["type", "score", "level", "impact"]
                }
              },
              mitigation: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "risks", "mitigation"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      const data = JSON.parse(response.text);
      setResult(data);
    } catch (e: any) {
      console.error("Simulation failed", e);
      setError(e.message || "Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <FlaskConical size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tighter text-white">Climate Lab</h2>
            <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Predictive Scenario Engine</p>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-6 py-4 rounded-2xl max-w-md">
           <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest">
             Simulate extreme environmental shifts to stress-test campus safety protocols and infrastructure resilience.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl">
            <h3 className="text-lg font-bold uppercase mb-8 flex items-center gap-3 text-white">
              <Zap size={20} className="text-amber-500 fill-amber-500" /> Parameters
            </h3>
            
            <div className="space-y-8">
              <SimulationSlider 
                icon={<Thermometer size={18} />} 
                label="Temperature" 
                value={temp} 
                min={-10} 
                max={60} 
                unit="°C" 
                onChange={setTemp} 
                color="bg-rose-500"
              />
              <SimulationSlider 
                icon={<Droplets size={18} />} 
                label="Humidity" 
                value={humidity} 
                min={0} 
                max={100} 
                unit="%" 
                onChange={setHumidity} 
                color="bg-indigo-500"
              />
              <SimulationSlider 
                icon={<Wind size={18} />} 
                label="AQI" 
                value={aqi} 
                min={0} 
                max={500} 
                unit="" 
                onChange={setAqi} 
                color="bg-emerald-500"
              />
            </div>

            <button 
              onClick={runSimulation}
              disabled={loading}
              className="w-full mt-10 bg-indigo-600 text-white border border-indigo-500 py-5 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-3 shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} className="fill-white" />}
              {loading ? 'Processing Scenario...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7">
          {error ? (
            <div className="h-full min-h-[400px] border border-rose-800 border-dashed rounded-[32px] flex flex-col items-center justify-center p-12 text-center bg-rose-900/20">
              <div className="w-20 h-20 bg-rose-900/50 rounded-full flex items-center justify-center mb-6 border border-rose-800 shadow-lg">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>
              <h4 className="text-xl font-bold uppercase text-rose-400 tracking-tight">Simulation Failed</h4>
              <p className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest mt-4 max-w-xs leading-loose">
                {error}
              </p>
            </div>
          ) : !result && !loading ? (
            <div className="h-full min-h-[400px] border border-slate-800 border-dashed rounded-[32px] flex flex-col items-center justify-center p-12 text-center bg-slate-900/50">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 shadow-lg">
                <Info size={32} className="text-slate-500" />
              </div>
              <h4 className="text-xl font-bold uppercase text-slate-400 tracking-tight">Awaiting Input</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 max-w-xs leading-loose">
                Adjust the environmental parameters and initiate the simulation to generate predictive risk insights.
              </p>
            </div>
          ) : loading ? (
            <div className="h-full min-h-[400px] bg-slate-900 border border-slate-800 rounded-[32px] flex flex-col items-center justify-center p-12 text-center shadow-2xl">
               <div className="relative">
                 <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                 <FlaskConical size={32} className="text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
               </div>
               <h4 className="text-xl font-bold uppercase text-white tracking-tight mt-8">Synthesizing Data</h4>
               <p className="text-emerald-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-3 animate-pulse">AI Engine: Stress-Testing Infrastructure</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[32px] shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert size={20} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase text-emerald-400/60 tracking-widest">Simulation Report</span>
                </div>
                <p className="text-xl font-bold uppercase text-emerald-100 leading-tight tracking-tight">
                  {result?.summary}
                </p>
              </div>

              {/* Risk Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result?.risks?.map((risk, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg hover:bg-slate-800 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{risk.type}</span>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                        risk.level === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        risk.level === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>{risk.level}</div>
                    </div>
                    <p className="text-2xl font-bold mb-2 text-white">{risk.score}%</p>
                    <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase line-clamp-3">{risk.impact}</p>
                  </div>
                ))}
              </div>

              {/* Mitigation Strategy */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl">
                <h4 className="text-sm font-bold uppercase mb-6 flex items-center gap-3 text-white">
                  <AlertTriangle size={16} className="text-rose-500" /> Mitigation Strategy
                </h4>
                <div className="space-y-3">
                  {result?.mitigation?.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-all">
                      <div className="w-5 h-5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded flex items-center justify-center text-[9px] font-bold shrink-0">0{i+1}</div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SimulationSlider = ({ icon, label, value, min, max, unit, color, onChange }: { 
  icon: any, label: string, value: number, min: number, max: number, unit: string, color: string, onChange: (v: number) => void 
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 ${color} text-white rounded-lg shadow-lg border border-white/10 flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{label}</span>
      </div>
      <span className="font-mono font-bold text-sm text-white">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-slate-700"
    />
  </div>
);

export default SimulationLab;
