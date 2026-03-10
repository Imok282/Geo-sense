
import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, ArrowRight, Zap, Mail, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (success: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setError(false);
    setSuccessMsg('');
  }, [isSignUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      const users = JSON.parse(localStorage.getItem('geosense_users') || '[]');
      const userExists = users.some((u: any) => u.username === username);
      
      if (userExists) {
        setError(true);
        return;
      }

      users.push({ username, email, password });
      localStorage.setItem('geosense_users', JSON.stringify(users));
      
      setSuccessMsg('Account Created! Authenticating...');
      setTimeout(() => {
        setIsSignUp(false);
        setUsername('');
        setPassword('');
      }, 1500);
      return;
    }

    const users = JSON.parse(localStorage.getItem('geosense_users') || '[]');
    const storedUser = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    // Final Version: Strictly use registered local users
    if (storedUser) {
      onLogin(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 grid-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none z-0"></div>
      
      <div className={`w-full max-w-[440px] bg-slate-900 border border-slate-800 shadow-2xl rounded-[60px] p-8 md:p-14 transition-all relative overflow-hidden z-10 ${error ? 'translate-x-2' : ''}`}>
        
        {isSignUp && (
          <button 
            onClick={() => setIsSignUp(false)}
            className="mb-8 flex items-center gap-2 font-bold text-[10px] uppercase text-slate-400 hover:text-white hover:translate-x-[-2px] transition-all"
          >
            <ChevronLeft size={16} /> Back to Login
          </button>
        )}

        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 rotate-3">
             <Shield size={42} />
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white text-center">
            {isSignUp ? 'Station Setup' : 'Node Access'}
          </h1>
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mt-2 text-center opacity-60">
            {isSignUp ? 'Join the Climate Defense Network' : 'Analyst Authentication Required'}
          </p>
        </div>

        {successMsg ? (
          <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-300">
            <div className="bg-emerald-500/20 text-emerald-400 p-5 rounded-full mb-6 border border-emerald-500/50">
              <CheckCircle2 size={48} />
            </div>
            <p className="font-bold text-center uppercase text-emerald-400 text-sm tracking-widest">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase ml-2 flex items-center gap-2 text-slate-500">
                <User size={12} /> Station Identity
              </label>
              <input 
                type="text" 
                placeholder="analyst_id"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-slate-950 border p-5 rounded-3xl font-bold text-white focus:bg-black focus:outline-none placeholder:text-slate-700 transition-colors ${error ? 'border-rose-500 text-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase ml-2 flex items-center gap-2 text-slate-500">
                  <Mail size={12} /> Registry Email
                </label>
                <input 
                  type="email" 
                  placeholder="analyst@geosense.pro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-5 rounded-3xl font-bold text-white focus:bg-black focus:outline-none focus:border-indigo-500 placeholder:text-slate-700 transition-colors"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase ml-2 flex items-center gap-2 text-slate-500">
                <Lock size={12} /> Encryption Key
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-950 border p-5 rounded-3xl font-bold text-white focus:bg-black focus:outline-none placeholder:text-slate-700 transition-colors ${error ? 'border-rose-500 text-rose-500' : 'border-slate-800 focus:border-indigo-500'}`}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-black py-6 rounded-[32px] font-bold text-2xl uppercase flex items-center justify-center gap-4 shadow-lg hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              {isSignUp ? 'Initialize' : 'Authorize'} <ArrowRight size={28} />
            </button>
          </form>
        )}

        {!isSignUp && !successMsg && (
          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsSignUp(true)}
              className="font-bold text-[11px] uppercase tracking-widest text-slate-600 hover:text-white transition-colors"
            >
              Request New Credentials
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between opacity-50">
           <div className="flex items-center gap-2 font-bold text-[9px] uppercase text-slate-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div> Secure_Session_V4
           </div>
           <Zap size={18} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default LoginView;
