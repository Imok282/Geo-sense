
import React from 'react';
// Fix: Added missing RefreshCcw import
import { RefreshCcw } from 'lucide-react';
import { ClimateRisk, RiskLevel } from '../types';

interface RiskBreakdownProps {
  risks: ClimateRisk[];
}

const RiskBreakdown: React.FC<RiskBreakdownProps> = ({ risks }) => {
  const getProgressColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'bg-emerald-400';
      case RiskLevel.MODERATE: return 'bg-amber-400';
      case RiskLevel.HIGH: return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {risks.length > 0 ? risks.map((risk, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <span className="font-bold text-[10px] text-slate-600 uppercase tracking-tight">{risk.type}</span>
            <span className="font-black text-[10px] text-slate-800">{risk.score}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className={`h-full ${getProgressColor(risk.level)} transition-all duration-1000 shadow-inner`} 
              style={{ width: `${risk.score}%` }}
            ></div>
          </div>
        </div>
      )) : (
        <div className="flex flex-col items-center justify-center py-8 opacity-20">
           <RefreshCcw className="animate-spin mb-2" size={24} />
           <span className="text-[10px] font-black uppercase">Scanning Sensor Clusters...</span>
        </div>
      )}
    </div>
  );
};

export default RiskBreakdown;
