import React, { useState } from 'react';
import { 
  Search,
  Zap,
  Microchip
} from 'lucide-react';
import { HARDWARE_CATALOG } from './hardwareData';

const HardwareLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCategories = HARDWARE_CATALOG.map(cat => ({
    ...cat,
    sensors: cat.sensors.filter(s => 
      (selectedCategory === 'all' || cat.id === selectedCategory) &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.useCase.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(cat => cat.sensors.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 border border-indigo-500 p-10 rounded-[60px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center shadow-lg">
            <Microchip size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Hardware Library</h2>
            <p className="text-white/80 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Supported Modules & Sensors</p>
          </div>
        </div>
        <div className="bg-black/20 border border-white/10 px-6 py-4 rounded-3xl max-w-md">
           <p className="text-[10px] font-bold text-white/90 uppercase leading-relaxed tracking-widest">
             Comprehensive catalog of ESP32-compatible sensors for environmental monitoring, safety, and infrastructure resilience.
           </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Search sensors, modules, or use cases..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-slate-900 border border-slate-800 rounded-[32px] font-bold text-lg text-white shadow-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-4 rounded-[24px] border font-bold uppercase text-xs whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-slate-800 border-slate-700 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            All Modules
          </button>
          {HARDWARE_CATALOG.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-4 rounded-[24px] border font-bold uppercase text-xs whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === cat.id ? `bg-indigo-600 border-indigo-500 text-white shadow-lg` : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              {React.cloneElement(cat.icon, { size: 16, className: selectedCategory === cat.id ? 'text-white' : 'text-slate-400' })}
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-12">
        {filteredCategories.map(cat => (
          <div key={cat.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center text-white shadow-lg`}>
                {React.cloneElement(cat.icon, { size: 24, className: "text-white" })}
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-white">{cat.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.sensors.map(sensor => (
                <div key={sensor.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-lg hover:bg-slate-800 transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl border border-slate-700 bg-slate-800 text-white shadow-md`}>
                      {React.cloneElement(sensor.icon, { size: 24, className: "text-white" })}
                    </div>
                    <div className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-700">
                      {sensor.id.toUpperCase()}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold uppercase mb-3 leading-tight text-white">{sensor.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mb-6 leading-relaxed flex-1">
                    {sensor.description}
                  </p>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mt-auto group-hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                       <Zap size={14} className="text-amber-500 fill-amber-500" />
                       <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Primary Use Case</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase leading-relaxed">
                      {sensor.useCase}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HardwareLibrary;
