import React, { useState } from 'react';

interface ConnectScreenProps {
  onConnect: (ip: string) => void;
  onDemo: () => void;
  error: string | null;
}

const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, onDemo, error }) => {
  const [ip, setIp] = useState('192.168.1.100');

  return (
    <div id="connect-screen" className="connect-screen">
      <div className="cs-brand">Geo<span>Sense</span></div>
      <div className="cs-sub">Deep Analysis Platform · Node v1.0</div>
      <div className="cs-box">
        <div className="cs-lbl">ESP32 IP Address</div>
        <input 
          className="cs-inp" 
          type="text" 
          placeholder="192.168.1.XX" 
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onConnect(ip)}
        />
        <div style={{fontFamily:'var(--mono)', fontSize:'9px', color:'var(--dim)'}}>Check Arduino Serial Monitor for IP</div>
        <button className="cs-btn primary" onClick={() => onConnect(ip)}>▶ Connect to Node</button>
        <button className="cs-btn secondary" onClick={onDemo}>Run Demo Mode (No Hardware)</button>
        {error && <div className="cs-err" style={{display:'block'}}>{error}</div>}
      </div>
      <div className="cs-hint">Both devices must be on the same WiFi network</div>
    </div>
  );
};

export default ConnectScreen;
