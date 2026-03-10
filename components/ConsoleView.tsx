
import React from 'react';
import { Plus, Minus, Wind, CloudRain } from 'lucide-react';

interface ConsoleViewProps {
  temperature: number;
  humidity: number;
  aqi: number;
}

const formatVal = (val: number) => (val === 0 ? "--" : val.toString());

const ConsoleView: React.FC<ConsoleViewProps> = ({ temperature, humidity, aqi }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in zoom-in duration-500 max-w-4xl mx-auto py-10">
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-full px-12 py-4 shadow-2xl mb-20">
        <h2 className="text-xl font-bold uppercase text-white tracking-tight">Environmental Console</h2>
      </div>

      <div className="flex items-center gap-12 mb-20">
        <ControlButton icon={<Minus size={32} />} />
        
        <div className="relative">
          <div className="w-64 h-64 bg-slate-900 border border-slate-700 rounded-[56px] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-500/5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
             <span className="text-8xl font-bold text-white leading-none relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{formatVal(temperature)}</span>
             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-4 relative z-10">Node_Temp_C</span>
          </div>
        </div>

        <ControlButton icon={<Plus size={32} />} />
      </div>

      <div className="w-full max-w-xl space-y-6">
        <ToggleItem icon={<CloudRain size={24} />} label="Humidity" value={humidity === 0 ? "--" : `${humidity}%`} active />
        <ToggleItem icon={<Wind size={24} />} label="AQI Quality" value={formatVal(aqi)} active />
      </div>
    </div>
  );
};

const ControlButton = ({ icon }: { icon: any }) => (
  <button className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-lg text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-105 active:scale-95 transition-all">
    {icon}
  </button>
);

const ToggleItem = ({ icon, label, value, active }: { icon: any, label: string, value: string, active: boolean }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 flex items-center justify-between shadow-xl hover:bg-slate-800 transition-all">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
        {icon}
      </div>
      <span className="text-sm font-bold uppercase text-slate-200">{label}</span>
    </div>
    <div className="flex items-center gap-6">
      <span className="text-xs font-bold text-indigo-400 uppercase">{value}</span>
      <div className={`w-12 h-7 ${active ? 'bg-indigo-600' : 'bg-slate-700'} rounded-full relative p-1 transition-colors cursor-pointer`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  </div>
);

export default ConsoleView;
