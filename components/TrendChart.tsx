
import React from 'react';

interface TrendChartProps {
  label: string;
  data: number[];
  color: string;
  unit: string;
  subtitle?: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ label, data, color, unit, subtitle }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = (max - min) || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 80 - ((val - min) / range) * 60; 
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] flex flex-col overflow-hidden shadow-lg h-full">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
        <div>
          <span className="font-bold text-sm text-white uppercase tracking-tight block">{label} History</span>
          {subtitle && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-800 px-2 rounded-full border border-slate-700">{subtitle}</span>}
        </div>
        <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold border border-slate-700">
          {data[data.length - 1]}{unit}
        </div>
      </div>
      
      <div className="flex-1 p-6 relative min-h-[100px]">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
           <defs>
            <linearGradient id={`grad-${label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,100 ${data.map((val, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((val - min) / range) * 80; // Adjusted scale for better fit
                return `L ${x},${y}`;
            }).join(' ')} L 100,100 Z`}
            fill={`url(#grad-${label.replace(/\s+/g, '-')})`}
            className="transition-all duration-500 ease-in-out"
          />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((val, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((val - min) / range) * 80;
                return `${x},${y}`;
            }).join(' ')}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-10">
           <div className="border-t border-slate-500 w-full"></div>
           <div className="border-t border-slate-500 w-full"></div>
           <div className="border-t border-slate-500 w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
