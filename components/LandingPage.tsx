
import React, { useState, useEffect } from 'react';
import {
  Zap, ShieldCheck, Cpu, Globe, ArrowRight, Radio, Activity, Wind,
  Map as MapIcon, ClipboardCheck, Leaf, Users, Building2, Scale,
  HeartPulse, Flag, ChevronDown, Layers, Database,
  Droplets, CheckCircle, Box, Drone, Lock, Mic, Bird, Thermometer,
  Cloud, Mountain, Shield, Wifi, WifiOff, Bluetooth, Battery,
  Satellite, Waves, Sparkles, WifiHigh, CpuIcon, CircuitBoard
} from 'lucide-react';

interface LandingPageProps {
  onContinue: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onContinue }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollActive, setScrollActive] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => {
      setScrollActive(window.scrollY > 20);
      setScrollY(window.scrollY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    document.body.style.overflow = 'auto';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.overflow = 'auto';
      document.body.style.overflowX = 'hidden';
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate 3D parallax effect
  const parallaxOffset = scrollY * 0.15;

  return (
    <div className="min-h-screen bg-[#0b0e17] selection:bg-indigo-500/30 selection:text-white font-['Plus_Jakarta_Sans'] overflow-x-hidden relative text-white">
      {/* 3D Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated 3D Grid with Google Pixel style perspective */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                         repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(30, 41, 59, 0.5) 30px),
                         repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(30, 41, 59, 0.5) 30px)`,
            backgroundSize: '100% 100%, 30px 30px, 30px 30px',
            transform: `perspective(400px) rotateX(45deg) translateY(${parallaxOffset * 0.3}px)`,
            transformOrigin: 'center top'
          }}
        />
        
        {/* Floating 3D Data Nodes */}
        <div className="absolute inset-0" style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${(i * 11 + 5) % 100}%`,
                top: `${(i * 17 + 3) % 50}%`,
                background: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'][i % 5],
                animationDelay: `${i * 0.3}s`,
                boxShadow: `0 0 10px ${['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'][i % 5]}`
              }}
            />
          ))}
        </div>
        
        {/* 3D Rotating Ring */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/20"
          style={{
            left: '10%',
            top: '20%',
            transform: `rotateX(60deg) rotateZ(${scrollY * 0.1}deg)`,
            animation: 'spin 30s linear infinite',
            transformOrigin: 'center center'
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/10"
          style={{
            right: '5%',
            bottom: '30%',
            transform: `rotateX(70deg) rotateZ(${scrollY * -0.1}deg)`,
            animation: 'spin 40s linear infinite reverse',
            transformOrigin: 'center center'
          }}
        />
        
        {/* Glow Effects following mouse */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.5s ease-out'
          }}
        />
      </div>
      
      {/* 3D CSS Animation Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotateX(60deg) rotateZ(0deg); }
          to { transform: rotateX(60deg) rotateZ(360deg); }
        }
      `}</style>
      
      {/* --- Google Pixel-Inspired Navigation --- */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-4 transition-all duration-300`}>
        <div className={`w-full max-w-7xl mx-auto bg-[#0d1419]/80 backdrop-blur-xl border border-[#1f263b] rounded-2xl px-6 py-3 shadow-2xl flex items-center justify-between transition-all duration-300 ${scrollActive ? 'translate-y-2' : 'translate-y-0'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={22} />
            </div>
            <span className="font-bold uppercase tracking-wider text-lg hidden sm:block text-white">
              GEOSENSE <span className="text-indigo-400">PRO</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <NavLink onClick={() => scrollToSection('features')} label="Platform" />
            <NavLink onClick={() => scrollToSection('tech')} label="The Tech" />
            <NavLink onClick={() => scrollToSection('impact')} label="Future 2027" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#64748b]">
              <Battery size={14} className="text-[#22c55e]" />
              <span>100%</span>
            </div>
            <button 
              onClick={onContinue}
              className="bg-[#f8fafc] text-[#0b0e17] px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#e2e8f0] transition-all shadow-lg hover:shadow-xl"
            >
              Access Portal
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 md:pt-56 pb-20 px-6 flex flex-col items-center">
        <div className={`max-w-6xl w-full text-center space-y-12 transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="inline-flex items-center gap-3 bg-[#0d1419] border border-[#1f263b] px-6 py-2 rounded-2xl shadow-lg animate-bounce-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748b]">Live Telemetry Matrix v5.0</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-extrabold uppercase tracking-tighter leading-[0.85] [text-wrap:balance]">
            Climate <br />
            <span className="text-indigo-500 italic [text-shadow:0_0_30px_rgba(99,102,241,0.3)]">Intelligence.</span>
          </h1>
          
          <p className="text-lg md:text-2xl font-bold text-[#64748b] max-w-3xl mx-auto leading-relaxed uppercase tracking-tight">
            The professional standard for localized climate monitoring. Bridging the gap between IoT clusters and AI reasoning.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center pt-8">
            <button 
              onClick={onContinue}
              className="group bg-indigo-600 border border-indigo-500 rounded-[30px] px-12 py-6 text-xl font-bold uppercase flex items-center gap-4 shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all text-white"
            >
              Launch Console <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="px-10 py-6 text-sm font-bold uppercase tracking-widest flex items-center gap-3 text-[#64748b] hover:text-white transition-colors"
            >
              Explore Capabilities <ChevronDown size={20} className="animate-bounce" />
            </button>
          </div>
        </div>

        {/* --- Dashboard Preview --- */}
        <div 
          className={`mt-24 w-full max-w-7xl relative transition-all duration-1000 delay-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        >
          <div className="bg-[#0d1419] border border-[#1f263b] rounded-[40px] p-4 md:p-8 shadow-2xl overflow-hidden relative">
             <div className="absolute inset-0 opacity-20" style={{
               background: `radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`,
               transition: 'background 0.3s ease'
             }} />
             <div className="flex items-center justify-between mb-8 border-b border-[#1f263b] pb-6 relative z-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/50 border border-rose-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50 border border-amber-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50 border border-emerald-500/30"></div>
                </div>
                <div className="bg-[#0b0e17] px-10 py-3 rounded-full border border-[#1f263b] font-mono text-xs tracking-[0.15em] text-[#64748b] shadow-inner">
                  geosense_terminal_main.sys
                </div>
                <div className="w-20"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                <div className="md:col-span-8">
                   <div className="bg-[#0b0e17] border border-[#1f263b] rounded-[30px] p-8 h-80 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-indigo-500/5"></div>
                      <div className="absolute inset-0 opacity-10" style={{
                        background: `conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,0.2), transparent, rgba(45,200,240,0.2), transparent, rgba(34,197,94,0.2), transparent)`,
                        animation: 'rotate 10s linear infinite'
                      }} />
                      <div className="relative z-10 flex flex-col h-full justify-between">
                         <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[10px] uppercase tracking-widest text-indigo-400">Real-Time Telemetry</h4>
                            <Activity size={24} className="text-[#64748b]" />
                         </div>
                         
                         {/* Google Pixel-Style Multi-Line Chart with 3D effect */}
                         <div className="flex items-end gap-1 flex-1 mt-6 h-48 relative">
                            {/* 3D Shadow Effect */}
                            <div className="absolute bottom-0 left-0 w-full h-full transform translate-x-2 translate-y-2 opacity-10">
                              <div className="flex items-end gap-1 h-full">
                                {[40, 55, 35, 70, 50, 85, 65, 95, 75, 88, 55, 70, 80, 60, 90].map((h, i) => (
                                  <div key={i} className="flex-1 bg-black rounded-t-sm" style={{ height: `${(h/100) * 100}%` }} />
                                ))}
                              </div>
                            </div>
                            
                            {/* Primary Data Series - Temperature */}
                            <div className="flex-1 flex flex-col gap-2 h-full justify-end relative">
                              {[40, 55, 35, 70, 50, 85, 65, 95, 75, 88, 55, 70, 80, 60, 90].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="flex-1 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-1000 hover:opacity-100 relative group"
                                  style={{ 
                                    height: isLoaded ? `${(h/100) * 100}%` : '0%',
                                    opacity: 0.8
                                  }}
                                >
                                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all" />
                                </div>
                              ))}
                            </div>
                            
                            {/* Secondary Data Series - Humidity */}
                            <div className="flex-1 flex flex-col gap-2 h-full justify-end relative">
                              {[30, 45, 25, 60, 40, 75, 55, 85, 65, 80, 45, 60, 70, 50, 85].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all duration-1000 hover:opacity-100 relative group"
                                  style={{ 
                                    height: isLoaded ? `${(h/100) * 100}%` : '0%',
                                    opacity: 0.7
                                  }}
                                >
                                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all" />
                                </div>
                              ))}
                            </div>
                            
                            {/* Tertiary Data Series - AQI */}
                            <div className="flex-1 flex flex-col gap-2 h-full justify-end relative">
                              {[20, 35, 15, 50, 30, 65, 45, 75, 55, 70, 35, 50, 60, 40, 75].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-1000 hover:opacity-100 relative group"
                                  style={{ 
                                    height: isLoaded ? `${(h/100) * 100}%` : '0%',
                                    opacity: 0.6
                                  }}
                                >
                                  <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all" />
                                </div>
                              ))}
                            </div>
                         </div>
                         
                         {/* Google Pixel-Style Legend */}
                         <div className="flex gap-6 mt-4 pt-4 border-t border-[#1f263b]">
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50"></div>
                             <span className="text-[10px] text-[#64748b] font-bold">TEMP</span>
                             <span className="text-[10px] text-rose-400">24.5°C</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                             <span className="text-[10px] text-[#64748b] font-bold">HUMID</span>
                             <span className="text-[10px] text-cyan-400">67%</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                             <span className="text-[10px] text-[#64748b] font-bold">AQI</span>
                             <span className="text-[10px] text-emerald-400">42</span>
                           </div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="md:col-span-4 space-y-6">
                   <div className="bg-[#0b0e17] text-emerald-400 p-8 rounded-[30px] border border-[#1f263b] h-full font-mono text-[11px] leading-relaxed shadow-lg">
                      <p className="opacity-40 mb-4">// INITIALIZING_GEONSENSE_V5</p>
                      <p className="text-white mb-6">Analyst: <span className="text-indigo-400">ROOT_ADMIN</span></p>
                      <div className="space-y-2">
                         <p className="flex justify-between"><span>LINK:</span> <span className="text-[#22c55e]">STABLE</span></p>
                         <p className="flex justify-between"><span>MOD:</span> <span className="text-white">GEMINI_3_FLASH</span></p>
                         <p className="flex justify-between"><span>IOT:</span> <span className="text-[#22c55e]">ACTIVE</span></p>
                         <p className="flex justify-between"><span>RSSI:</span> <span className="text-white">-42 dBm</span></p>
                      </div>
                      <div className="mt-10 pt-10 border-t border-white/10">
                         <p className="animate-pulse">{'>'} LISTENING_ON_PORT_0XAF32...</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
      </section>

      {/* --- 3D Scrollable Sensor Cards Section --- */}
      <section className="py-20 px-6 flex justify-center bg-[#090e12]">
        <div className="w-full max-w-7xl">
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-white mb-4">
                3D <span className="text-indigo-400">Sensor</span> Matrix
              </h2>
              <p className="text-[#64748b] uppercase tracking-widest text-sm">
                Immersive data visualization with Google Pixel precision
              </p>
           </div>
           
           <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory">
              {/* 3D Card: Temperature */}
              <div className="snap-center shrink-0 w-72 h-80 bg-gradient-to-br from-rose-900/20 to-rose-800/10 border border-rose-500/30 rounded-[30px] p-6 group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                   style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 5}deg)` }}>
                 <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-all" />
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-rose-600/30 flex items-center justify-center">
                          <Thermometer size={24} className="text-rose-400" />
                       </div>
                       <span className="text-[10px] text-rose-400 font-bold">LIVE</span>
                    </div>
                    <div className="text-5xl font-bold text-rose-400 mb-2">24.5°</div>
                    <div className="text-[10px] text-[#64748b] uppercase tracking-wider">Celsius</div>
                    <div className="flex-1 flex items-end mt-4">
                       <div className="w-full h-2 bg-[#1f263b] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" style={{ width: '73%' }} />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D Card: Humidity */}
              <div className="snap-center shrink-0 w-72 h-80 bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-500/30 rounded-[30px] p-6 group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                   style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 8}deg) rotateX(${-mousePos.y * 4}deg)` }}>
                 <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-all" />
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-cyan-600/30 flex items-center justify-center">
                          <Droplets size={24} className="text-cyan-400" />
                       </div>
                       <span className="text-[10px] text-cyan-400 font-bold">OPTIMAL</span>
                    </div>
                    <div className="text-5xl font-bold text-cyan-400 mb-2">67%</div>
                    <div className="text-[10px] text-[#64748b] uppercase tracking-wider">Relative</div>
                    <div className="flex-1 flex items-end mt-4">
                       <div className="w-full h-2 bg-[#1f263b] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style={{ width: '67%' }} />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D Card: AQI */}
              <div className="snap-center shrink-0 w-72 h-80 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/30 rounded-[30px] p-6 group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                   style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 6}deg)` }}>
                 <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-all" />
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 flex items-center justify-center">
                          <Wind size={24} className="text-emerald-400" />
                       </div>
                       <span className="text-[10px] text-emerald-400 font-bold">GOOD</span>
                    </div>
                    <div className="text-5xl font-bold text-emerald-400 mb-2">42</div>
                    <div className="text-[10px] text-[#64748b] uppercase tracking-wider">AQI Index</div>
                    <div className="flex-1 flex items-end mt-4">
                       <div className="w-full h-2 bg-[#1f263b] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: '42%' }} />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D Card: Water Level */}
              <div className="snap-center shrink-0 w-72 h-80 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-[30px] p-6 group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                   style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 5}deg)` }}>
                 <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-all" />
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-blue-600/30 flex items-center justify-center">
                          <Waves size={24} className="text-blue-400" />
                       </div>
                       <span className="text-[10px] text-blue-400 font-bold">NORMAL</span>
                    </div>
                    <div className="text-5xl font-bold text-blue-400 mb-2">48%</div>
                    <div className="text-[10px] text-[#64748b] uppercase tracking-wider">Capacity</div>
                    <div className="flex-1 flex items-end mt-4">
                       <div className="w-full h-2 bg-[#1f263b] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: '48%' }} />
                       </div>
                    </div>
                 </div>
              </div>

              {/* 3D Card: TDS */}
              <div className="snap-center shrink-0 w-72 h-80 bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-[30px] p-6 group hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
                   style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 11}deg) rotateX(${-mousePos.y * 5}deg)` }}>
                 <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-all" />
                 <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-amber-600/30 flex items-center justify-center">
                          <Sparkles size={24} className="text-amber-400" />
                       </div>
                       <span className="text-[10px] text-amber-400 font-bold">SAFE</span>
                    </div>
                    <div className="text-5xl font-bold text-amber-400 mb-2">290</div>
                    <div className="text-[10px] text-[#64748b] uppercase tracking-wider">PPM</div>
                    <div className="flex-1 flex items-end mt-4">
                       <div className="w-full h-2 bg-[#1f263b] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: '58%' }} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Features Section with 3D Cards --- */}
      <section id="features" className="py-32 px-6 flex justify-center bg-[#090e12] border-y border-[#1f263b]">
        <div className="w-full max-w-7xl">
           <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
              <div className="max-w-2xl">
                 <span className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-4 block">Core Architecture</span>
                 <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-none text-white">
                   The <span className="italic text-[#64748b]">Integrated</span> Platform.
                 </h2>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#64748b] max-w-sm">
                Built to handle high-fidelity telemetry and deliver actionable climate risk reports in real-time.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Feature: Maps Grounding */}
              <div className="md:col-span-8 bg-indigo-900/10 border border-indigo-500/20 p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#0b0e17] border border-[#1f263b] rounded-3xl flex items-center justify-center mb-10 shadow-lg group-hover:rotate-6 transition-transform">
                       <MapIcon size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-4xl font-bold uppercase mb-6 tracking-tighter text-white">Geo-Spectral Grounding</h3>
                    <p className="text-lg font-bold text-[#64748b] uppercase leading-relaxed max-w-lg">
                      Gemini AI correlates live data with geographical landmarks to identify threats from factories, water bodies, and traffic zones.
                    </p>
                 </div>
                 <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-5 group-hover:opacity-10 transition-opacity text-white">
                    <MapIcon size={400} />
                 </div>
              </div>

              {/* Feature: Compliance */}
              <div className="md:col-span-4 bg-emerald-900/10 border border-emerald-500/20 p-10 rounded-[50px] shadow-2xl flex flex-col justify-center text-center group">
                 <div className="w-20 h-20 bg-[#0b0e17] border border-[#1f263b] rounded-[28px] flex items-center justify-center mb-8 mx-auto shadow-lg group-hover:-rotate-3 transition-transform">
                    <Scale size={36} className="text-emerald-400" />
                 </div>
                 <h3 className="text-2xl font-bold uppercase mb-4 text-white">Risk Audit</h3>
                 <p className="text-xs font-bold text-[#64748b] uppercase tracking-tight leading-loose">
                   Automated 7-day retrospective reporting for safety compliance and ESG auditing.
                 </p>
              </div>

              {/* Feature: Zero Latency */}
              <div className="md:col-span-5 bg-rose-900/10 border border-rose-500/20 p-12 rounded-[50px] shadow-2xl group">
                 <div className="w-16 h-16 bg-[#0b0e17] border border-[#1f263b] rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                    <Zap size={32} className="text-rose-400" />
                 </div>
                 <h3 className="text-3xl font-bold uppercase mb-4 tracking-tighter text-white">Direct Edge Bridge</h3>
                 <p className="text-base font-bold text-[#64748b] uppercase leading-relaxed">
                   Physical Serial Handshake bypasses cloud latency, providing zero-lag environmental telemetry directly to your browser.
                 </p>
              </div>

              {/* Feature: IoT Connectivity */}
              <div className="md:col-span-7 bg-amber-900/5 border border-amber-500/20 p-12 rounded-[50px] shadow-2xl flex flex-col md:flex-row items-center gap-10 group">
                 <div className="flex-1">
                   <div className="w-16 h-16 bg-[#0b0e17] border border-[#1f263b] rounded-3xl flex items-center justify-center mb-8 shadow-lg">
                     <Cpu size={32} className="text-amber-400" />
                   </div>
                   <h3 className="text-3xl font-bold uppercase mb-4 tracking-tighter text-white">Modular Nodes</h3>
                   <p className="text-base font-bold text-[#64748b] uppercase leading-relaxed">
                     Support for ESP32 and Arduino clusters. Extensible architecture for CO2, PM2.5, and humidity arrays.
                   </p>
                 </div>
                 <div className="bg-[#0b0e17] p-6 rounded-3xl border border-[#1f263b] rotate-2 shadow-lg">
                    <div className="flex gap-1 mb-3">
                       <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <code className="text-emerald-400 font-mono text-[9px] uppercase tracking-tighter">station_0xAF32_UP</code>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- Tech Stack Section --- */}
      <section id="tech" className="py-32 px-6 flex justify-center">
         <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
               <div className="lg:col-span-5 space-y-10">
                  <div className="inline-block bg-[#0d1419] border border-[#1f263b] px-6 py-2 rounded-2xl shadow-lg">
                    <Layers size={20} className="inline mr-2 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Protocol Intelligence</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-extrabold uppercase tracking-tighter leading-[0.85] text-white">
                    The <span className="italic text-indigo-500 underline decoration-slate-700 decoration-8 underline-offset-8">Future</span> Layer.
                  </h2>
                  <p className="text-lg font-bold text-[#64748b] uppercase leading-relaxed tracking-tight">
                    GeoSense utilizes a 3-layer stack to process environmental signals into high-impact action items.
                  </p>
               </div>

               <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <TechCard 
                    step="01" 
                    title="Edge Polling" 
                    desc="Raw telemetry ingestion via physical serial bridge or localized wireless hotspots." 
                    icon={<Cpu size={24} />} 
                  />
                  <TechCard 
                    step="02" 
                    title="Maps Grounding" 
                    desc="Spatial context engine linking sensor data with localized geographical features." 
                    icon={<Globe size={24} />} 
                  />
                  <TechCard 
                    step="03" 
                    title="Gemini Logic" 
                    desc="Multimodal reasoning engine calculating risk levels and compliance roadmap." 
                    icon={<Zap size={24} />} 
                  />
                   <TechCard 
                     step="04" 
                     title="Audit Reports" 
                     desc="Automated report generation for facility safety and environmental regulatory standards." 
                     icon={<ClipboardCheck size={24} />} 
                   />
                </div>
             </div>
          </div>
       </section>

      {/* --- Services Section --- */}
      <section id="services" className="py-32 px-6 flex justify-center bg-[#090e12] border-y border-[#1f263b]">
         <div className="w-full max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
               <div className="max-w-2xl">
                  <span className="text-cyan-400 font-bold uppercase text-xs tracking-widest mb-4 block">Our Services</span>
                  <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-none text-white">
                    Alpine <span className="italic text-cyan-500">Intelligence</span> Services.
                  </h2>
               </div>
               <p className="text-sm font-bold uppercase tracking-widest text-[#64748b] max-w-sm">
                 Specialized solutions for high-alpine environments. Protecting what matters most.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Water Resource Monitoring */}
               <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border border-cyan-500/20 p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="w-16 h-16 bg-cyan-600/20 border border-cyan-500/30 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                        <Droplets size={32} className="text-cyan-400" />
                     </div>
                     <h3 className="text-3xl font-bold uppercase mb-6 tracking-tighter text-white">Water Resource Monitoring</h3>
                     <p className="text-base font-bold text-[#64748b] uppercase leading-relaxed mb-8">
                       Sustainable surveillance for secure water supply in high-alpine regions.
                     </p>
                     <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-cyan-400" /> Drinking Water Supply Monitoring
                        </li>
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-cyan-400" /> Flood & Early Warning Systems
                        </li>
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-cyan-400" /> Leak Detection in Pipelines
                        </li>
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-cyan-400" /> Snowmelt & Reservoir Management
                        </li>
                     </ul>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
               </div>

               {/* Visitor Flow Management */}
               <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 p-12 rounded-[50px] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                        <Users size={32} className="text-purple-400" />
                     </div>
                     <h3 className="text-3xl font-bold uppercase mb-6 tracking-tighter text-white">Visitor Flow Management</h3>
                     <p className="text-base font-bold text-[#64748b] uppercase leading-relaxed mb-8">
                       Intelligent management for ski resorts. Optimize visitor guidance with AI.
                     </p>
                     <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-purple-400" /> Smart Traffic Control
                        </li>
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-purple-400" /> Real-time Slope Monitoring
                        </li>
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-purple-400" /> Smart Parking Solutions
                        </li>
                        <li className="flex items-center gap-3 text-slate-300 text-sm font-bold uppercase">
                           <CheckCircle size={16} className="text-purple-400" /> Restaurant Capacity Management
                        </li>
                     </ul>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
               </div>
            </div>
         </div>
      </section>

      {/* --- Impact 2027 Section --- */}
      <section id="impact" className="py-32 px-6 flex justify-center bg-[#05080b] text-white relative overflow-hidden border-t border-[#1f263b]">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`
        }} />
        <div className="w-full max-w-7xl relative z-10">
          <div className="text-center mb-24 space-y-8">
             <div className="inline-flex items-center gap-4 bg-indigo-600 border border-indigo-400/30 px-8 py-3 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <Flag size={20} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Global Resilience Agenda 2027</span>
             </div>
             <h2 className="text-6xl md:text-9xl font-extrabold uppercase tracking-tighter leading-none italic">
               Prepare for <span className="text-indigo-500">Scale.</span>
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ImpactPoint 
              icon={<Scale size={32} />} 
              title="Carbon Transparency" 
              desc="Meet upcoming 2027 environmental regulations with verifiable node-level atmospheric data." 
            />
            <ImpactPoint 
              icon={<HeartPulse size={32} />} 
              title="Health Security" 
              desc="Protect students and staff with proactive alerts for PM2.5 spikes and localized heat islands." 
            />
            <ImpactPoint 
              icon={<Building2 size={32} />} 
              title="Facility ROI" 
              desc="Optimize energy efficiency and resource management through high-precision environmental mapping." 
            />
          </div>
        </div>
      </section>

      {/* --- World-First Features --- */}
      <section id="worldfirst" className="py-32 px-6 flex justify-center bg-[#05080b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20"></div>
        
        <div className="w-full max-w-7xl relative z-10">
          <div className="text-center mb-20 space-y-8">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-violet-600 to-cyan-600 border border-violet-400/30 px-8 py-3 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              <Zap size={20} />
              <span className="text-[11px] font-bold uppercase tracking-widest">World-First Innovation</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-extrabold uppercase tracking-tighter leading-none text-white">
              No One Else <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Has This.</span>
            </h2>
            <p className="text-lg font-bold text-[#64748b] max-w-2xl mx-auto uppercase tracking-wide">
              10 exclusive technologies that make GeoSense PRO the most advanced climate intelligence platform on Earth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WorldFirstCard 
              icon={<Box size={28} />}
              title="Digital Twin"
              description="3D real-time replica of alpine terrain with predictive flood/landslide simulation."
              color="#8b5cf6"
              status="Coming 2026"
            />
            <WorldFirstCard 
              icon={<Drone size={28} />}
              title="Drone Deployment"
              description="Autonomous drones deploy sensors to dead zones after storms."
              color="#06b6d4"
              status="Coming 2026"
            />
            <WorldFirstCard 
              icon={<Shield size={28} />}
              title="Gecko Mounts"
              description="Biomimetic adhesion - sticks to any surface. No drilling required."
              color="#10b981"
              status="Coming 2025"
            />
            <WorldFirstCard 
              icon={<Lock size={28} />}
              title="Quantum Encryption"
              description="Post-quantum cryptography. Government-grade security."
              color="#f59e0b"
              status="Coming 2027"
            />
            <WorldFirstCard 
              icon={<Users size={28} />}
              title="Citizen Network"
              description="10,000 hikers wearing sensors. Gamified climate scouts."
              color="#ec4899"
              status="Beta"
            />
            <WorldFirstCard 
              icon={<Mic size={28} />}
              title="Voice Mesh"
              description="Emergency network works without cell towers. 15km range."
              color="#ef4444"
              status="Coming 2026"
            />
            <WorldFirstCard 
              icon={<Bird size={28} />}
              title="Bioacoustics"
              description="AI listens to insects & birds. Detects ecosystem collapse."
              color="#84cc16"
              status="Pilot"
            />
            <WorldFirstCard 
              icon={<Thermometer size={28} />}
              title="Thermal Imaging"
              description="Drone-mounted thermal cameras. Find heat leaks from sky."
              color="#f97316"
              status="Available"
            />
            <WorldFirstCard 
              icon={<Cloud size={28} />}
              title="Carbon Isotopes"
              description="Distinguish natural vs man-made CO2. Prove emissions source."
              color="#6366f1"
              status="Coming 2026"
            />
            <WorldFirstCard 
              icon={<Mountain size={28} />}
              title="Avalanche AI"
              description="15-minute avalanche warning. Automatic road closure."
              color="#0ea5e9"
              status="Pilot"
            />
          </div>
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="py-48 px-6 flex justify-center">
         <div className="w-full max-w-5xl bg-indigo-600 text-white p-12 md:p-32 rounded-[60px] border border-indigo-400 shadow-2xl shadow-indigo-500/20 relative overflow-hidden text-center group">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <Zap size={300} fill="white" />
            </div>
            
            <div className="relative z-10 space-y-12">
               <h2 className="text-5xl md:text-9xl font-extrabold uppercase tracking-tighter leading-none">
                 Secure Your <br />
                 <span className="italic underline decoration-white/20 decoration-[12px] underline-offset-[16px]">Environment.</span>
               </h2>
               <p className="text-xl md:text-3xl font-bold uppercase tracking-widest text-white/60 max-w-3xl mx-auto">
                 Join the professional <span className="text-white">climate monitoring ecosystem.</span>
               </p>
               
               <button 
                  onClick={onContinue}
                  className="bg-white text-black px-16 py-8 rounded-[40px] text-4xl font-bold uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-6 mx-auto"
                >
                  Enter Command <ArrowRight size={48} />
                </button>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-24 px-6 flex flex-col items-center gap-10 border-t border-[#1f263b] bg-[#05080b]">
         <div className="flex items-center gap-4">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
               <ShieldCheck size={24} />
            </div>
            <span className="font-bold uppercase tracking-tighter text-2xl text-white">GeoSense <span className="text-indigo-400">PRO</span></span>
         </div>
         <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Compliance</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
         </div>
         <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-[#475569] mt-10">© 2025 GEOSENSE_CORP // UNIT_0xAF32</p>
      </footer>
    </div>
  );
};

const NavLink = ({ onClick, label }: { onClick: () => void, label: string }) => (
  <button 
    onClick={onClick} 
    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748b] hover:text-white transition-colors relative group"
  >
    {label}
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-500 transition-all group-hover:w-full"></span>
  </button>
);

const TechCard = ({ step, title, desc, icon }: { step: string, title: string, desc: string, icon: any }) => (
  <div className="bg-[#0d1419] border border-[#1f263b] p-8 rounded-[40px] shadow-lg hover:-translate-y-2 transition-all group">
     <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-[#0b0e17] border border-[#1f263b] rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors text-[#64748b]">
           {icon}
        </div>
        <span className="font-bold text-[10px] uppercase text-[#64748b] tracking-widest">{step}</span>
     </div>
     <h4 className="text-xl font-bold uppercase mb-3 text-white">{title}</h4>
     <p className="text-xs font-bold text-[#64748b] uppercase leading-relaxed">{desc}</p>
  </div>
);

const ImpactPoint = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 rounded-[40px] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex flex-col items-center text-center">
     <div className="w-20 h-20 bg-[#0b0e17] border border-[#1f263b] rounded-3xl flex items-center justify-center mb-8 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "text-white" })}
     </div>
     <h4 className="text-2xl font-bold uppercase mb-4 tracking-tighter text-white">{title}</h4>
     <p className="text-sm font-bold text-[#64748b] uppercase leading-relaxed tracking-tight">{desc}</p>
  </div>
);

const WorldFirstCard = ({ icon, title, description, color, status }: { icon: any, title: string, description: string, color: string, status: string }) => (
  <div className="group p-6 rounded-[30px] border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: color }}></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: color }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: `${color}20`, color }}>
          {status}
        </span>
      </div>
      <h4 className="text-lg font-bold uppercase mb-2 text-white">{title}</h4>
      <p className="text-xs font-medium text-[#64748b] leading-relaxed">{description}</p>
    </div>
  </div>
);

export default LandingPage;
