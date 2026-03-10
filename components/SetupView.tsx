
import React, { useState } from 'react';
import { Usb, ShieldAlert, Zap, Bluetooth, Radio, RefreshCcw, Wifi } from 'lucide-react';

interface SetupViewProps {
  onLink: () => void;
  onLinkBLE?: () => void;
  onLinkWiFi?: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const SetupView: React.FC<SetupViewProps> = ({ onLink, onLinkBLE, onLinkWiFi, onSkip, isLoading = false }) => {
  const [mode, setMode] = useState<'wired' | 'wireless' | 'wifi'>('wired');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 grid-bg overflow-y-auto relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none z-0"></div>
      
      <div className="w-full max-w-[500px] bg-slate-900 border border-slate-800 shadow-2xl rounded-[56px] p-8 md:p-12 animate-in fade-in zoom-in duration-500 relative z-10">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className={`w-24 h-24 rounded-[32px] border flex items-center justify-center mb-6 shadow-lg ${
            isLoading ? 'bg-slate-800 border-slate-700' :
            mode === 'wired' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
            mode === 'wireless' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' :
            'bg-amber-500/20 border-amber-500/30 text-amber-400'
          }`}>
             {isLoading ? <RefreshCcw size={48} className="text-slate-500 animate-spin" /> : 
              mode === 'wired' ? <Usb size={48} /> : 
              mode === 'wireless' ? <Bluetooth size={48} /> : <Wifi size={48} />}
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white leading-none">
            {isLoading ? 'Syncing...' : mode === 'wired' ? 'USB Link' : mode === 'wireless' ? 'BLE Link' : 'Wi-Fi Hotspot'}
          </h1>
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.3em] mt-3">
            {isLoading ? 'Requesting Pulse...' : 'Protocol Initialization'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-[32px] border border-slate-800 mb-10 overflow-hidden">
          <button 
            onClick={() => setMode('wired')}
            className={`flex-1 py-3 rounded-2xl font-bold text-[9px] uppercase tracking-widest transition-all ${mode === 'wired' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            USB
          </button>
          <button 
            onClick={() => setMode('wireless')}
            className={`flex-1 py-3 rounded-2xl font-bold text-[9px] uppercase tracking-widest transition-all ${mode === 'wireless' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            BLE
          </button>
          <button 
            onClick={() => setMode('wifi')}
            className={`flex-1 py-3 rounded-2xl font-bold text-[9px] uppercase tracking-widest transition-all ${mode === 'wifi' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Wi-Fi
          </button>
        </div>

        <div className="space-y-6 mb-10">
          {mode === 'wifi' ? (
            <>
              <div className="flex gap-5 items-start">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg border border-amber-400/30">1</div>
                <div>
                  <p className="font-bold text-sm uppercase text-white">Toggle Radio</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Press the BOOT button on your ESP32 to open the hotspot window.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg border border-amber-400/30">2</div>
                <div>
                  <p className="font-bold text-sm uppercase text-white">Local Link</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Connect your computer to 'GEOSENSE_CORE' network.</p>
                </div>
              </div>
            </>
          ) : mode === 'wired' ? (
            <>
              <div className="flex gap-5 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg border border-emerald-400/30">1</div>
                <div>
                  <p className="font-bold text-sm uppercase text-white">Physical Connect</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Plug your ESP32 into a USB data port.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-5 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg border border-indigo-400/30">1</div>
                <div>
                  <p className="font-bold text-sm uppercase text-white">BLE Pair</p>
                  <p className="text-xs font-bold text-slate-500 uppercase">Ensure wireless is enabled via button trigger.</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => {
              if (mode === 'wired') onLink();
              else if (mode === 'wireless') onLinkBLE?.();
              else onLinkWiFi?.();
            }}
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-slate-800 text-slate-500' : mode === 'wired' ? 'bg-emerald-600 hover:bg-emerald-500' : mode === 'wireless' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-amber-600 hover:bg-amber-500'} text-white py-6 rounded-[28px] font-bold text-xl uppercase flex items-center justify-center gap-4 shadow-lg active:scale-[0.98] transition-all`}
          >
            {isLoading ? 'Linking...' : 'Initialize'} <Zap size={24} fill="white" />
          </button>
          
          <button 
            onClick={onSkip}
            className="w-full bg-transparent border border-slate-700 text-slate-500 py-4 rounded-[28px] font-bold text-xs uppercase tracking-widest hover:text-white hover:border-slate-500 transition-colors"
          >
            Skip (Offline)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
