import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  History, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Info,
  Thermometer,
  Wind,
  Droplets
} from 'lucide-react';
import { getHistory, HistoryPoint } from '../services/historyService';

const HistoryView: React.FC = () => {
  const [data, setData] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    setData(getHistory());
  }, []);

  if (data.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-12 text-center bg-slate-900 border border-slate-800 rounded-[60px] shadow-2xl">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-8 border border-slate-700 shadow-lg">
          <History size={48} className="text-slate-500" />
        </div>
        <h3 className="text-3xl font-bold uppercase text-white tracking-tight mb-4">No History Data</h3>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed">
          The system requires at least 24 hours of telemetry to generate historical trend analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 border border-indigo-500 p-10 rounded-[60px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm">
            <TrendingUp size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Temporal Trends</h2>
            <p className="text-indigo-200 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">7-Day Retrospective Engine</p>
          </div>
        </div>
        <div className="bg-black/20 border border-white/10 px-6 py-4 rounded-3xl max-w-md backdrop-blur-md relative z-10">
           <p className="text-[10px] font-medium text-indigo-100 uppercase leading-relaxed tracking-widest">
             Analyzing multi-day environmental shifts to identify long-term climate patterns and infrastructure stress points.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[60px] shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold uppercase flex items-center gap-3 text-white">
              <Thermometer size={24} className="text-rose-500" /> Thermal Variance
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-full border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Temp</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full border border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Humidity</span>
               </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b', 
                    borderRadius: '16px', 
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Area type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="humidity" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AQI History */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[60px] shadow-2xl text-white">
          <h3 className="text-xl font-bold uppercase mb-10 flex items-center gap-3">
            <Wind size={24} className="text-emerald-400" /> AQI History
          </h3>
          
          <div className="h-[300px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b', 
                    borderRadius: '12px', 
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }} 
                />
                <Bar dataKey="aqi" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Peak AQI</span>
                <span className="text-xl font-bold text-emerald-400">{Math.max(...data.map(d => d.aqi))}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Avg Temp</span>
                <span className="text-xl font-bold text-rose-400">{(data.reduce((acc, d) => acc + d.temp, 0) / data.length).toFixed(1)}°</span>
             </div>
          </div>
        </div>
      </div>

      {/* Snapshot Log */}
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-[60px] shadow-2xl">
        <h3 className="text-2xl font-bold uppercase mb-10 flex items-center gap-4 text-white">
          <Calendar size={32} className="text-indigo-500" /> Snapshot Archive
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((point, i) => (
            <div key={i} className="p-6 bg-slate-800/50 border border-slate-700 rounded-[32px] hover:bg-slate-800 transition-all group">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{point.date}</span>
                <div className="w-8 h-8 bg-slate-700 text-slate-400 rounded-xl flex items-center justify-center border border-slate-600 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all">
                   <ChevronRight size={16} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[8px] font-bold uppercase text-slate-500 mb-1">Temp</p>
                  <p className="text-lg font-bold text-white">{point.temp}°</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase text-slate-500 mb-1">AQI</p>
                  <p className="text-lg font-bold text-white">{point.aqi}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase text-slate-500 mb-1">Hum</p>
                  <p className="text-lg font-bold text-white">{point.humidity}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
