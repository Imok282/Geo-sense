import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  ArrowRight,
  Radio
} from 'lucide-react';

interface Alert {
  id: string;
  location: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  time: string;
}

const AlertFeed: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      location: 'Sector 42 - Industrial Hub',
      type: 'CRITICAL',
      message: 'AQI spike detected (342). Immediate filtration protocols recommended for nearby facilities.',
      time: '2m ago'
    },
    {
      id: '2',
      location: 'South Campus Gateway',
      type: 'WARNING',
      message: 'Thermal variance exceeding 2027 safety thresholds. Cooling systems at 90% capacity.',
      time: '15m ago'
    },
    {
      id: '3',
      location: 'Central Reservoir',
      type: 'INFO',
      message: 'Hydration levels stabilized. Flood risk downgraded to SAFE.',
      time: '1h ago'
    }
  ]);

  // Simulate new alerts occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      const locations = ['North Ridge', 'East Plaza', 'Science Block', 'Admin Wing'];
      const types: ('CRITICAL' | 'WARNING' | 'INFO')[] = ['CRITICAL', 'WARNING', 'INFO'];
      const messages = [
        'Unusual particulate density detected.',
        'Humidity levels dropping rapidly.',
        'System sync successful with regional grid.',
        'High UV radiation warning issued.'
      ];

      const newAlert: Alert = {
        id: Date.now().toString(),
        location: locations[Math.floor(Math.random() * locations.length)],
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        time: 'Just now'
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 5));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl relative group shadow-lg hover:bg-slate-800 transition-all animate-in slide-in-from-right-4 duration-300 cursor-default">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <MapPin size={10} className="text-slate-500" />
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">{alert.location}</span>
              </div>
              <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded-md border ${
                alert.type === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                alert.type === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {alert.type}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-300 leading-relaxed mb-3">
              {alert.message}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={10} className="text-slate-500" />
                <span className="text-[8px] font-bold uppercase text-slate-500">{alert.time}</span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[8px] font-bold uppercase text-indigo-400 hover:text-indigo-300">
                Details <ArrowRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertFeed;
