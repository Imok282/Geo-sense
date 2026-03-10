
import React, { useState } from 'react';
import { Scale, Leaf, Target, TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight, Database, RefreshCcw } from 'lucide-react';
import { SensorData, SustainabilityReport } from '../types';
import { getSustainabilityAudit } from '../services/geminiService';

interface SustainabilityLedgerProps {
  sensorData: SensorData;
}

const SustainabilityLedger: React.FC<SustainabilityLedgerProps> = ({ sensorData }) => {
  const [report, setReport] = useState<SustainabilityReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAudit = async () => {
    if (sensorData.temperature === 0) return;
    setLoading(true);
    try {
      const result = await getSustainabilityAudit(sensorData);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12">
        <div className="w-24 h-24 border-8 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
        <p className="font-black uppercase tracking-[0.3em] text-white animate-pulse">Calculating 2027 Compliance Matrix...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12">
        <div className="bg-white border-2 border-black p-12 rounded-[60px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg">
          <Database size={64} className="text-indigo-600 mx-auto mb-6" />
          <h3 className="text-2xl font-black uppercase text-black mb-4">Sustainability Ledger</h3>
          <p className="font-bold text-slate-500 uppercase text-xs leading-relaxed mb-10">
            Initialize hardware nodes and request a compliance audit to generate your facility's net-zero roadmap.
          </p>
          <button 
            onClick={fetchAudit}
            disabled={sensorData.temperature === 0}
            className={`w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl uppercase flex items-center justify-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-indigo-500 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${sensorData.temperature === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Generate Audit <RefreshCcw size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 max-w-7xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-slate-900 text-white p-12 rounded-[60px] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <Scale size={240} />
          </div>
          <div className="relative z-10">
            <div className="bg-indigo-500/10 px-6 py-2 rounded-full inline-flex items-center gap-3 mb-10 border border-indigo-500/20">
              <Leaf size={20} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Sustainability Audit 0xAF32</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.85] mb-8">
              Compliance <br />
              <span className="text-indigo-500">Scorecard.</span>
            </h2>
            <div className="flex items-center gap-10">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-500 tracking-[0.4em] mb-2">Readiness Score</p>
                <p className="text-7xl font-bold text-white">{report.overallScore}%</p>
              </div>
              <div className="w-[1px] h-20 bg-slate-700"></div>
              <div className="max-w-xs">
                <p className="text-sm font-bold text-slate-400 uppercase leading-relaxed">
                  Based on localized particulate mean and thermal variance, your facility is trending {report.overallScore > 70 ? 'ahead of' : 'below'} national 2027 benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-10 rounded-[60px] shadow-2xl flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
            <TrendingUp size={32} />
          </div>
          <h4 className="text-2xl font-bold uppercase text-white mb-2">Trajectory</h4>
          <button 
            onClick={fetchAudit}
            className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest hover:text-indigo-300 mt-2 underline decoration-2 underline-offset-4"
          >
            Refresh Analysis
          </button>
          <div className="mt-8 pt-8 border-t border-slate-800">
             <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-bold uppercase text-slate-500">2024 Base</span>
                <span className="text-[10px] font-bold uppercase text-slate-500">2027 Target</span>
             </div>
             <div className="h-3 bg-slate-800 rounded-full mt-3 overflow-hidden border border-slate-700">
                <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" style={{ width: `${report.overallScore}%` }}></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {report.metrics.map((metric, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] shadow-lg group hover:bg-slate-800 transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl border ${
                  metric.status === 'COMPLIANT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  metric.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                   {metric.status === 'COMPLIANT' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score</p>
                   <p className="text-xl font-bold text-white">{metric.score}%</p>
                </div>
             </div>
             <h5 className="text-lg font-bold uppercase mb-2 text-white">{metric.category}</h5>
             <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed mb-6">
               Target: {metric.target}
             </p>
          </div>
        ))}
      </div>

      <div className="bg-emerald-950/30 border border-emerald-900/50 p-12 rounded-[80px] shadow-2xl relative overflow-hidden">
         <div className="flex flex-col lg:flex-row gap-12 items-start relative z-10">
            <div className="lg:w-1/3">
               <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/20 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/10">
                  <Target size={40} />
               </div>
               <h3 className="text-4xl font-bold uppercase tracking-tighter text-white leading-tight mb-6">Strategic <br />Priorities.</h3>
               <p className="text-sm font-bold text-emerald-400/80 uppercase leading-relaxed">
                 Our AI consultant has generated a risk-mitigation roadmap specifically for India’s upcoming environmental framework.
               </p>
            </div>
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
               {report.roadmap.map((task, i) => (
                 <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-lg group hover:bg-slate-800 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                       <span className="w-8 h-8 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs border border-slate-700">0{i+1}</span>
                       <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Action Item</span>
                    </div>
                    <p className="text-sm font-bold text-slate-200 uppercase leading-relaxed">
                      {task}
                    </p>
                    <div className="mt-6 flex justify-end">
                       <ArrowUpRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SustainabilityLedger;
