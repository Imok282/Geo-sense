
import React, { useMemo } from 'react';
import { Wind, Activity, ShieldCheck, Zap, Radio } from 'lucide-react';

interface StreamsViewProps {
  trends: number[];
  aqi: number;
  packets: {id: string, lat: string, value: string}[];
  observation: string;
}

const StreamsView: React.FC<StreamsViewProps> = ({ trends, aqi, packets, observation }) => {
  // Memoize graph calculation for stability
  const graphData = useMemo(() => {
    const max = Math.max(...trends, 1);
    const min = Math.min(...trends, 0);
    const range = (max - min) || 1;
    
    const points = trends.length > 1 ? trends.map((val, i) => {
      const x = (i / (trends.length - 1)) * 100;
      const y = 90 - ((val - min) / range) * 80; // Scaled to use 80% of height
      return `${x},${y}`;
    }).join(' ') : "0,90 100,90";

    const pathD = `M 0,100 ${trends.length > 1 ? trends.map((val, i) => `L ${(i / (trends.length - 1)) * 100},${90 - ((val - min) / range) * 80}`).join(' ') : "L 100,90"} L 100,100 Z`;

    return { points, pathD };
  }, [trends]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* AQI Chart View */}
        <div className="lg:col-span-8 bg-white border-2 border-black rounded-[60px] p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col group overflow-hidden relative">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Radio size={16} className="text-indigo-600 animate-pulse" />
                <h3 className="text-xs font-black uppercase text-black tracking-[0.3em]">Telemetry Flow Analysis</h3>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buffer: {trends.length} points active</p>
            </div>
            <div className="flex flex-col items-end">
               <div className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full text-xs font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {aqi > 0 ? aqi : '--'} AQI
              </div>
              <span className="text-[9px] font-black text-indigo-600 uppercase mt-2">Ground-Truth Stream</span>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] relative mt-4">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="aqi-grad-stream" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path 
                d={graphData.pathD} 
                fill="url(#aqi-grad-stream)" 
                className="transition-all duration-700"
              />
              <polyline 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                points={graphData.points} 
                className="transition-all duration-700"
              />
              {/* Scanline Effect */}
              <rect x="0" y="0" width="100" height="1" fill="#4f46e5" opacity="0.1" className="animate-bounce" />
            </svg>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
              <div className="border-t-[2px] border-black w-full"></div>
              <div className="border-t-[2px] border-black w-full"></div>
              <div className="border-t-[2px] border-black w-full"></div>
              <div className="border-t-[2px] border-black w-full"></div>
            </div>
          </div>
        </div>

        {/* Sync Status Card */}
        <div className="lg:col-span-4 bg-emerald-50 border-2 border-black rounded-[60px] p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="relative z-10 flex flex-col items-center">
             <div className="w-20 h-20 bg-white border-2 border-black rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 group-hover:rotate-6 transition-transform">
                <ShieldCheck size={40} className="text-emerald-600 stroke-[3px]" />
             </div>
             <h2 className="text-5xl font-black uppercase text-black mb-2 tracking-tighter">Synced</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Module integrity: 100%</p>
           </div>
           {/* Decorative Radar Sweep */}
           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent animate-pulse pointer-events-none"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Packet Inspection Terminal */}
        <div className="lg:col-span-7 bg-white border-2 border-black rounded-[60px] p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-base font-black uppercase flex items-center gap-4 text-black tracking-widest">
                <Activity size={24} className="stroke-[3.5px] text-indigo-600" /> Packet Buffer
              </h3>
              <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-slate-200 border border-black/10"></div>
                 <div className="w-3 h-3 rounded-full bg-slate-200 border border-black/10"></div>
              </div>
           </div>
           <div className="flex-1 space-y-4">
             {packets.length > 0 ? packets.map((p, i) => (
               <div key={i} className="flex items-center justify-between py-4 border-b-2 border-black/5 last:border-0 group animate-in slide-in-from-left-4 duration-300 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                 <div className="flex items-center gap-5">
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
                   <div className="flex flex-col">
                      <span className="font-mono text-[11px] font-black text-black tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{p.id}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Verified</span>
                   </div>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-tighter">Latency</p>
                      <p className="font-mono text-[10px] font-black text-black">{p.lat}</p>
                   </div>
                   <div className="bg-white border-2 border-black text-black px-4 py-2 rounded-2xl font-mono text-[10px] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
                     {p.value}
                   </div>
                 </div>
               </div>
             )) : (
               <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-black/10 rounded-[40px] opacity-30">
                 <Activity size={48} className="mb-4 text-slate-400 animate-bounce" />
                 <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Awaiting Telemetry Pulses...</span>
               </div>
             )}
           </div>
        </div>

        {/* AI Interpretation Panel */}
        <div className="lg:col-span-5 bg-black text-white rounded-[60px] border-2 border-black p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] relative flex flex-col justify-center overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <ShieldCheck size={280} />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Zap size={32} className="text-indigo-400 fill-indigo-400" />
            </div>
            <h3 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.5em] mb-6">Cluster Analysis Result</h3>
            <p className="text-lg md:text-xl font-black italic leading-relaxed text-slate-300">
              "{observation}"
            </p>
            <div className="mt-10 pt-8 border-t border-slate-800 flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analysis Engine: Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamsView;
