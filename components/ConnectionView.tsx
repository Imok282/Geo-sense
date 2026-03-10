
import React, { useState } from 'react';
// Added RefreshCcw to imports
import { Wifi, Plus, Zap, RefreshCcw } from 'lucide-react';

interface ConnectionViewProps {
  onConnect: () => void;
  isConnecting: boolean;
}

const ConnectionView: React.FC<ConnectionViewProps> = ({ onConnect, isConnecting }) => {
  const [step, setStep] = useState<'intro' | 'add'>('intro');

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#B8A7E0] grid-bg">
        <div className="w-full max-w-[360px] bg-white border-2 border-black neo-shadow rounded-[48px] p-10 flex flex-col items-center">
          {/* Illustration Section */}
          <div className="relative mb-10 w-full aspect-square flex items-center justify-center">
             <div className="absolute w-56 h-56 bg-indigo-200 rounded-full blur-3xl opacity-60"></div>
             <div className="relative z-10 w-44 h-44 bg-white border-2 border-black rounded-full flex items-center justify-center overflow-hidden neo-shadow-sm">
                <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-[#D1FAE5] rounded-full border-2 border-black"></div>
                <div className="bg-black text-white p-5 rounded-3xl transform rotate-12 shadow-xl">
                   <Zap size={40} fill="white" />
                </div>
             </div>
          </div>
          
          <div className="bg-[#D1FAE5] border-2 border-black px-10 py-3 rounded-2xl mb-3 neo-shadow-sm">
             <h1 className="text-3xl font-black uppercase tracking-tighter text-black">GEOSENSE</h1>
          </div>
          <div className="bg-black text-white px-5 py-1 rounded-lg mb-12">
             <p className="text-[11px] font-black uppercase tracking-widest">Local Climate Node // v4.0</p>
          </div>

          <button 
            onClick={() => setStep('add')}
            className="w-full bg-[#FFB86C] border-2 border-black neo-shadow py-5 rounded-3xl font-black text-xl hover:translate-y-[-2px] transition-all active:translate-y-[2px] mb-6 text-black"
          >
            Get started
          </button>
          
          <button className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] hover:text-black transition-colors underline decoration-2 underline-offset-4">
            Skip Initialization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#B8A7E0] grid-bg">
      <div className="w-full max-w-[360px] bg-white border-2 border-black neo-shadow rounded-[48px] overflow-hidden">
        <div className="bg-[#D1FAE5] border-b-2 border-black py-5 px-8 text-center">
           <h2 className="text-xl font-black uppercase text-black tracking-tight">Add a device</h2>
        </div>
        
        <div className="p-10 flex flex-col items-center">
           <p className="text-center text-[11px] font-black uppercase text-slate-800 mb-10 max-w-[200px] leading-relaxed">
             Securely link your localized ESP32 sensor cluster for real-time analysis.
           </p>
           
           <div className="relative mb-14 flex items-center justify-center">
             <div className="absolute w-[180px] h-[180px] border-2 border-slate-100 rounded-full"></div>
             <div className="absolute w-[130px] h-[130px] border-2 border-slate-200 rounded-full animate-pulse"></div>
             <div className="absolute w-[80px] h-[80px] border-2 border-slate-300 rounded-full"></div>
             <div className="w-14 h-14 bg-indigo-100 border-2 border-black rounded-2xl flex items-center justify-center neo-shadow-sm">
                <span className="font-black text-lg text-black">("A")</span>
             </div>
           </div>

           <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-3xl bg-slate-50 hover:bg-white transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="bg-black text-white p-2.5 rounded-xl"><Wifi size={20} className="stroke-[3px]" /></div>
                    <span className="font-black text-sm uppercase text-black">ESP32_0xAF32</span>
                 </div>
                 <button 
                   onClick={onConnect}
                   disabled={isConnecting}
                   className="bg-[#FFB86C] border-2 border-black text-black text-[11px] font-black px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-300 transition-all active:scale-95"
                 >
                   {isConnecting ? <RefreshCcw size={14} className="animate-spin" /> : <Plus size={14} className="stroke-[3px]" />} 
                   {isConnecting ? 'LINKING' : 'CONNECT'}
                 </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border-2 border-black rounded-3xl opacity-30 grayscale cursor-not-allowed">
                 <div className="flex items-center gap-4">
                    <div className="bg-slate-200 p-2.5 rounded-xl"><Wifi size={20} /></div>
                    <span className="font-black text-sm uppercase text-slate-600">Backup_Node</span>
                 </div>
                 <div className="bg-slate-200 border-2 border-slate-300 text-slate-400 text-[10px] font-black px-4 py-2 rounded-xl">
                   OFFLINE
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionView;
