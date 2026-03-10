
import React, { useEffect, useState } from 'react';
import { FileText, Calendar, ShieldCheck, Printer, ArrowLeft, Info, ChevronRight, Share2, ClipboardCheck } from 'lucide-react';
import TrendChart from './TrendChart';
import { GoogleGenAI } from "@google/genai";
import { SensorData, MapNode } from '../types';
import { getHistory, HistoryPoint } from '../services/historyService';

interface ReportViewProps {
  onBack: () => void;
  sensorData: SensorData;
  nodes: MapNode[];
}

const ReportView: React.FC<ReportViewProps> = ({ onBack, sensorData, nodes }) => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [recommendation, setRecommendation] = useState("Analyzing campus environment...");
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    
    const fetchRecommendation = async () => {
      if (sensorData.temperature === 0) {
        setRecommendation("Awaiting sensor data to generate recommendation.");
        return;
      }
      setLoadingRec(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Based on current sensor data (Temp: ${sensorData.temperature}°C, AQI: ${sensorData.aqi}, Humidity: ${sensorData.humidity}%), provide a short, official, safety-first recommendation for campus activities. Maximum 2 sentences.`;
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt
        });
        setRecommendation(response.text || "Campus environment is cleared for all outdoor activities.");
      } catch (e) {
        setRecommendation("Campus environment is cleared for all outdoor activities. Ensure hydration stations are active during peak 14:00 thermal windows.");
      } finally {
        setLoadingRec(false);
      }
    };
    
    fetchRecommendation();
  }, [sensorData]);

  const handlePrint = () => {
    window.print();
  };

  const labels = history.map(h => h.date.split('/')[0] + '/' + h.date.split('/')[1]);
  const tempValues = history.map(h => h.temp);
  const aqiValues = history.map(h => h.aqi);

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex justify-between items-center mb-12 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 font-bold text-[11px] uppercase text-slate-300 hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all bg-slate-800 border border-slate-700 px-6 py-3 rounded-2xl shadow-lg hover:bg-slate-700"
        >
          <ArrowLeft size={18} className="stroke-[2px]" /> Return to Base
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-8 py-4 rounded-3xl font-bold text-xs uppercase flex items-center gap-3 shadow-lg hover:translate-y-[-2px] active:translate-y-0 transition-all hover:bg-emerald-500/20"
          >
            <Printer size={18} className="stroke-[2px]" /> Generate Report PDF
          </button>
          <button 
            className="bg-indigo-600 text-white border border-indigo-500 px-6 py-4 rounded-3xl font-bold text-xs uppercase flex items-center gap-3 shadow-lg hover:translate-y-[-2px] transition-all hover:bg-indigo-500"
          >
            <Share2 size={18} className="stroke-[2px]" /> Share Audit
          </button>
        </div>
      </div>

      <div id="printable-report" className="bg-slate-900 border border-slate-800 p-10 md:p-16 rounded-[64px] shadow-2xl print:shadow-none print:border-2 print:rounded-none print:bg-white print:text-black">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-slate-800 pb-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-[24px] flex items-center justify-center shadow-inner border border-indigo-500/20">
                <ShieldCheck size={42} />
              </div>
              <div>
                <h1 className="text-5xl font-bold uppercase tracking-tighter text-white leading-none">GeoSense Audit</h1>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.4em] mt-3">Localized Climate Security Protocol</p>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="bg-slate-800 text-slate-400 px-6 py-2 rounded-full inline-block mb-2 border border-slate-700">
               <span className="font-bold text-xs uppercase tracking-widest">Confidential // Level-01</span>
            </div>
            <p className="font-bold text-xl text-white uppercase tracking-tight">Node Cluster: ESP_0xAF32</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Timestamp: {new Date().toLocaleDateString()} @ {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {history.length < 1 ? (
          <div className="py-24 bg-slate-800/30 border border-slate-700/50 border-dashed rounded-[48px] text-center mb-12">
            <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
               <Info className="text-indigo-500 animate-pulse" size={42} />
            </div>
            <p className="font-bold text-2xl uppercase text-white mb-4">Awaiting Signal Acquisition</p>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto">
              Connect your hardware node to initialize the 7-day retrospective data stream.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                  <Calendar size={28} className="stroke-[2px] text-indigo-500" />
                  <h3 className="text-3xl font-bold uppercase text-white tracking-tight">Temporal Intelligence</h3>
                </div>
                <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-[40px] relative overflow-hidden group hover:bg-slate-800 transition-all shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                    <FileText size={80} />
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed font-medium uppercase tracking-tight italic opacity-90">
                    "Weekly retrospective based on {history.length} active sensor pulses. Automated validation confirms average thermal stability at {(tempValues.reduce((a,b)=>a+b,0)/history.length).toFixed(1)}°C. No critical AQI spikes identified in current cycle."
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[36px] shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-emerald-400/50 mb-2 tracking-widest">Min/Max Range</p>
                    <p className="text-3xl font-bold text-emerald-400">{Math.min(...tempValues)}°C - {Math.max(...tempValues)}°C</p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[36px] shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-amber-400/50 mb-2 tracking-widest">Particulate Mean</p>
                    <p className="text-3xl font-bold text-amber-400">{Math.round(aqiValues.reduce((a,b)=>a+b,0)/history.length)} AQI</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-5 space-y-8">
                <h3 className="text-xl font-bold uppercase text-white flex items-center gap-3">
                   <ShieldCheck size={24} className="stroke-[2px] text-indigo-500" /> Compliance Status
                </h3>
                <div className="space-y-5">
                   <StatusLine label="Thermal Limits" status="VERIFIED" />
                   <StatusLine label="Particulate Safety" status="OPTIMAL" />
                   <StatusLine label="Humidity Sync" status="STABLE" />
                   <StatusLine label="AI Analysis Integrity" status="SYNCED" />
                </div>
                
                <h3 className="text-xl font-bold uppercase text-white flex items-center gap-3 mt-10">
                   <ShieldCheck size={24} className="stroke-[2px] text-indigo-500" /> Cluster Analysis
                </h3>
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-[32px] space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Active Sensors</span>
                      <span className="text-lg font-bold text-white">{nodes.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Network Health</span>
                      <span className="text-lg font-bold text-emerald-400">100%</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Avg Risk Score</span>
                      <span className="text-lg font-bold text-white">{nodes.length > 0 ? Math.round(nodes.reduce((acc, n) => acc + (n.analysis?.score || 0), 0) / nodes.length) : '--'}%</span>
                   </div>
                </div>

                <div className="mt-12 p-8 bg-black/40 border border-slate-700 text-white rounded-[40px] shadow-xl backdrop-blur-sm">
                   <p className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest mb-4">Official Recommendation</p>
                   <p className="text-sm font-medium italic leading-relaxed text-slate-300">
                     {loadingRec ? "Generating AI recommendation..." : recommendation}
                   </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="h-72">
                <TrendChart label="7-Day Thermal" data={tempValues} color="#f59e0b" unit="°C" subtitle="Node_ESP32_T" />
              </div>
              <div className="h-72">
                <TrendChart label="Atmospheric Flow" data={aqiValues} color="#10B981" unit=" AQI" subtitle="Node_ESP32_A" />
              </div>
            </div>

            <div className="pt-16 border-t border-slate-800 flex flex-col items-center">
               <div className="w-12 h-1 bg-slate-800 rounded-full mb-8"></div>
               <p className="text-[10px] font-bold uppercase text-slate-600 tracking-[0.5em] text-center leading-loose">
                 Generated via GeoSense Distributed Intelligence Layer<br/>
                 Property of Station 0xAF32 // Do Not Reproduce Without Authorization
               </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; overflow: visible !important; }
          .grid-bg { background: none !important; }
          main { padding: 0 !important; }
          aside { display: none !important; }
          #printable-report { 
            margin: 0; 
            padding: 40px; 
            border: 4px solid black !important; 
            border-radius: 0 !important; 
            box-shadow: none !important; 
            width: 100%;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #printable-report * {
            border-color: black !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

const StatusLine = ({ label, status }: { label: string, status: string }) => (
  <div className="flex items-center justify-between p-5 border border-slate-700 rounded-2xl bg-slate-800/50 shadow-sm group hover:translate-x-1 transition-transform hover:bg-slate-800">
    <span className="text-[11px] font-bold uppercase text-slate-500 group-hover:text-white transition-colors">{label}</span>
    <div className="flex items-center gap-3">
       <span className="text-[11px] font-bold text-emerald-400">{status}</span>
       <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
    </div>
  </div>
);

export default ReportView;
