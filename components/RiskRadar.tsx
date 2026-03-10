
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Zap, Target } from 'lucide-react';
import { ClimateRisk, RiskLevel } from '../types';

interface RiskRadarProps {
  risks: ClimateRisk[];
}

const RiskRadar: React.FC<RiskRadarProps> = ({ risks }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Smooth high-frequency rotation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1.5) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return '#f43f5e'; // Rose-500
      case RiskLevel.MODERATE: return '#fbbf24'; // Amber-400
      default: return '#10b981'; // Emerald-500
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto group perspective-1000">
      {/* Outer Glow Ring */}
      <div className="absolute -inset-4 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-1000"></div>
      
      {/* Radar Main Housing */}
      <div className="absolute inset-0 bg-slate-900 rounded-full border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Polar Coordinate Grids */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Axis Lines */}
          <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
          <div className="absolute h-full w-[1px] bg-slate-700/50"></div>
          <div className="absolute w-full h-[1px] bg-slate-700/50 rotate-45"></div>
          <div className="absolute w-full h-[1px] bg-slate-700/50 -rotate-45"></div>
          
          {/* Concentric Intensity Rings */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <div 
              key={i} 
              className="absolute border border-slate-700/50 rounded-full flex items-center justify-center"
              style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
            >
              {scale === 1 && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7px] font-bold text-slate-600 uppercase tracking-widest">Range_Max</span>
              )}
            </div>
          ))}
        </div>

        {/* The Deep Sweep - High Contrast Gradient */}
        <div 
          className="absolute inset-0 origin-center transition-transform duration-75 ease-linear pointer-events-none"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Main Sweep Gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/20 via-emerald-500/5 to-transparent origin-bottom rounded-tl-full blur-[2px]"></div>
          
          {/* Leading Edge Line */}
          <div className="absolute top-0 left-1/2 -translate-x-[1px] w-[2px] h-1/2 bg-emerald-500 origin-bottom shadow-[0_0_15px_#10b981]"></div>
        </div>

        {/* Risk Markers */}
        {risks.map((risk, idx) => {
          // Semi-random deterministic positioning based on type name index
          const angle = (risk.type.charCodeAt(0) * 15 + idx * 120) % 360;
          const distance = 25 + (Math.max(risk.score, 10) / 100) * 60; // Distance from center
          const x = 50 + Math.cos((angle * Math.PI) / 180) * (distance / 2);
          const y = 50 + Math.sin((angle * Math.PI) / 180) * (distance / 2);
          
          const isDetected = Math.abs(rotation - (angle + 90) % 360) < 15;

          return (
            <div 
              key={idx}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 ${isDetected ? 'scale-125 opacity-100' : 'opacity-60 scale-100'}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Outer Pulse */}
              {isDetected && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: getLevelColor(risk.level) }}
                ></div>
              )}
              
              {/* Core Dot */}
              <div 
                className="w-3 h-3 rounded-full border border-white/20 shadow-[0_0_10px_currentColor] relative z-10"
                style={{ backgroundColor: getLevelColor(risk.level), color: getLevelColor(risk.level) }}
              ></div>
              
              {/* Floating Label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                <div className={`px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-900/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-tight shadow-lg transition-all ${isDetected ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}>
                  {risk.type}: {risk.score}%
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Scanning Shimmer */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-1/4 w-full animate-[bounce_4s_infinite] opacity-30"></div>
      </div>

      {/* Center Command Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 z-30 group-hover:rotate-45 transition-transform duration-500">
        <Target size={24} className="text-emerald-500 animate-pulse" />
      </div>

      {/* Legend - Neo Brutalist Style */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl shadow-xl whitespace-nowrap z-40">
        <LegendItem color="#f43f5e" label="Critical" />
        <div className="w-[1px] h-4 bg-slate-700 self-center"></div>
        <LegendItem color="#fbbf24" label="Warning" />
        <div className="w-[1px] h-4 bg-slate-700 self-center"></div>
        <LegendItem color="#10b981" label="Optimal" />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color: color }}></div>
    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">{label}</span>
  </div>
);

export default RiskRadar;
