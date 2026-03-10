
import React from 'react';

interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ label, value, unit, icon, colorClass }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 shadow-lg rounded-3xl p-4 flex items-center space-x-4 transition-transform hover:scale-[1.02] hover:border-slate-700`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-slate-400 font-bold">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
