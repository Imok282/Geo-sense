
import React, { useState } from 'react';
import { Cpu, Zap, ShieldCheck, ArrowLeft, Copy, CheckCircle, List, Radio, Globe } from 'lucide-react';

interface SetupGuideProps {
  onBack: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onBack }) => {
  const [copied, setCopied] = useState(false);

  const combinedCode = `/**
 * GEOSENSE PRO v5.0.0 - THERMAL-OPTIMIZED GATEWAY
 * FEATURE: Button-Triggered Wi-Fi Hotspot (Comm-on-Demand)
 * 
 * Logic: Radio is OFF by default to prevent overheating.
 * Press the BOOT button (GPIO 0) to activate the 5-minute sync window.
 */
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include "DHT.h"

// Hardware Config
const int BUTTON_PIN = 0; // ESP32 'BOOT' button
const int DHT_PIN = 4;
#define DHTTYPE DHT11
DHT dht(DHT_PIN, DHTTYPE);

WebServer server(80);
bool gatewayActive = false;
unsigned long gatewayStartTime = 0;
const unsigned long GATEWAY_TIMEOUT = 300000; // 5 Minutes

void handleData() {
  JsonDocument doc;
  doc["t"] = dht.readTemperature();
  doc["h"] = dht.readHumidity();
  doc["a"] = random(15, 35); // Simulated AQI buffer
  doc["r"] = 0;
  
  String buf;
  serializeJson(doc, buf);
  server.send(200, "application/json", buf);
}

void startGateway() {
  Serial.println("SYS: ACTIVATING_GATEWAY...");
  WiFi.softAP("GEOSENSE_CORE", "geosense123");
  server.on("/telemetry", handleData);
  server.begin();
  gatewayActive = true;
  gatewayStartTime = millis();
}

void stopGateway() {
  Serial.println("SYS: INHIBITING_RADIO_THERMAL_PROTECTION");
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_OFF);
  gatewayActive = false;
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  dht.begin();
  
  // Start in Low Power / Cool State
  WiFi.mode(WIFI_OFF);
  Serial.println("GEOSENSE: STANDBY [PRESS_BUTTON_TO_SYNC]");
}

void loop() {
  // 1. Monitor Button for Activation
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(50); // Debounce
    if (!gatewayActive) startGateway();
    else stopGateway();
    while(digitalRead(BUTTON_PIN) == LOW); // Wait for release
  }

  // 2. Handle Server if Active
  if (gatewayActive) {
    server.handleClient();
    
    // Auto-shutdown to prevent heat
    if (millis() - gatewayStartTime > GATEWAY_TIMEOUT) {
      stopGateway();
    }
  }

  // 3. Continuous Data Logging (Internal Only)
  static unsigned long lastLog = 0;
  if (millis() - lastLog > 5000) {
    lastLog = millis();
    Serial.printf("LOG: T=%.1f H=%.1f | Radio: %s\n", 
      dht.readTemperature(), dht.readHumidity(), 
      gatewayActive ? "ON" : "OFF");
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(combinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 animate-in fade-in duration-500">
      <button onClick={onBack} className="flex items-center gap-2 font-black text-[10px] uppercase text-slate-400 mb-8 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Exit Technical Manual
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/10 rotate-3 border border-indigo-500/30">
                 <Cpu size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Thermal v5.0.0</h1>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">On-Demand Wireless Gateway</p>
              </div>
            </div>

            <div className="bg-amber-500/10 text-amber-200 p-6 rounded-[32px] mb-10 border border-amber-500/20 shadow-lg">
               <div className="flex items-center gap-3 mb-3">
                  <Zap size={20} className="text-amber-400 fill-amber-400" />
                  <span className="font-black uppercase text-xs text-amber-400">Low-Power Protocol</span>
               </div>
               <p className="text-xs font-bold leading-relaxed opacity-80 uppercase text-amber-100/80">
                 To prevent overheating, the Wi-Fi module is disabled by default. Use the physical BOOT button on your ESP32 to open the 5-minute sync window.
               </p>
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Radio size={18} className="text-indigo-400" />
                <h3 className="font-black text-sm uppercase text-white">Activation Steps</h3>
              </div>
              <div className="space-y-5">
                {[
                  "Flash the code. The device starts in 'Silent Mode'.",
                  "Press the BOOT button (GPIO 0) once to activate Hotspot.",
                  "Connect your PC to 'GEOSENSE_CORE' (Password: geosense123).",
                  "Return to the App Dashboard and select 'Wi-Fi Sync'."
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-8 h-8 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 border border-slate-700 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">{i+1}</div>
                    <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed pt-1.5 group-hover:text-slate-200 transition-colors">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="bg-slate-950 border border-slate-800 rounded-[48px] flex flex-col overflow-hidden shadow-2xl h-[700px]">
            <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-widest ml-4">thermal_v5.ino</h3>
              </div>
              <button 
                onClick={handleCopy}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Success' : 'Copy Source'}
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto font-mono text-[11px] text-emerald-400 custom-scrollbar bg-slate-950">
              <pre className="whitespace-pre-wrap leading-relaxed opacity-90">
                {combinedCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
