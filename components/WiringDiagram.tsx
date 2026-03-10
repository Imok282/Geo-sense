import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const WiringDiagram: React.FC = () => {
  const [viewMode, setViewMode] = useState<'wiring' | 'code'>('wiring');
  const [copied, setCopied] = useState(false);

  const firmwareCode = `/*
 * GeoSense 2.0 - Full Sensor Suite Firmware
 * Target: ESP32 DevKit V1
 * 
 * LIBRARIES REQUIRED (Install via Arduino Library Manager):
 * 1. DHT sensor library by Adafruit
 * 2. Adafruit Unified Sensor
 * 3. Adafruit MPU6050
 * 4. Adafruit ADXL345
 * 5. Adafruit INA219
 * 6. BH1750 by Christopher Laws
 * 7. TinyGPSPlus by Mikal Hart
 * 8. TFT_eSPI by Bodmer (Requires User_Setup.h config)
 * 9. ArduinoJson by Benoit Blanchon
 */

#include <Wire.h>
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>
#include <Adafruit_INA219.h>
#include <BH1750.h>
#include <TinyGPS++.h>
#include <TFT_eSPI.h> // Hardware-specific library
#include <ArduinoJson.h>

// --- PIN DEFINITIONS ---
#define DHTPIN 25
#define DHTTYPE DHT22

#define TRIG_PIN 12
#define ECHO_PIN 13

#define RAIN_PIN 32
#define SOIL_PIN 33
#define TDS_PIN 35
#define PH_PIN 36
#define TURBIDITY_PIN 39
#define MQ135_PIN 34

#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GSM_RX_PIN 26
#define GSM_TX_PIN 27

// --- OBJECTS ---
DHT dht(DHTPIN, DHTTYPE);
Adafruit_MPU6050 mpu;
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
Adafruit_INA219 ina219;
BH1750 lightMeter;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // UART2
TFT_eSPI tft = TFT_eSPI(); 

// --- VARIABLES ---
unsigned long lastMsg = 0;
const long interval = 2000; // 2 seconds update rate

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // Init Sensors
  dht.begin();
  Wire.begin(); // SDA=21, SCL=22
  
  if (!mpu.begin()) Serial.println("Failed to find MPU6050 chip");
  if (!accel.begin()) Serial.println("No ADXL345 detected");
  if (!ina219.begin()) Serial.println("Failed to find INA219 chip");
  lightMeter.begin();

  // Init Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  
  // Init Display
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.drawString("GeoSense v2.0", 10, 10, 4);
}

void loop() {
  // Non-blocking delay
  if (millis() - lastMsg > interval) {
    lastMsg = millis();
    readSensors();
  }
  
  // Feed GPS
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
}

void readSensors() {
  StaticJsonDocument<512> doc;

  // 1. Environmental
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int aqi = analogRead(MQ135_PIN);
  
  // 2. Water / Distance
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.034 / 2;
  
  int rainVal = analogRead(RAIN_PIN);
  int soilVal = analogRead(SOIL_PIN);
  int rainStatus = map(rainVal, 0, 4095, 100, 0); // Invert logic usually

  // 3. Water Quality
  int tdsVal = analogRead(TDS_PIN);
  int phVal = analogRead(PH_PIN);
  int turbVal = analogRead(TURBIDITY_PIN);
  
  // 4. Motion (MPU6050)
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float vib = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z));

  // 5. Energy (INA219)
  float busvoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();
  float lux = lightMeter.readLightLevel();

  // 6. GPS
  double lat = gps.location.lat();
  double lng = gps.location.lng();
  int sats = gps.satellites.value();

  // --- JSON PACKET ---
  doc["t"] = t;
  doc["h"] = h;
  doc["a"] = aqi;
  doc["w"] = distanceCm;
  doc["r"] = rainStatus;
  doc["s"] = soilVal;
  
  doc["tds"] = tdsVal;
  doc["ph"] = phVal; // Needs calibration formula
  doc["tb"] = turbVal;
  
  doc["v"] = vib;
  
  doc["vol"] = busvoltage;
  doc["cur"] = current_mA;
  doc["pwr"] = power_mW;
  doc["lx"] = lux;
  
  doc["lat"] = lat;
  doc["lng"] = lng;
  doc["sat"] = sats;

  serializeJson(doc, Serial);
  Serial.println();
  
  // Update Display
  tft.fillScreen(TFT_BLACK);
  tft.setCursor(0, 0);
  tft.printf("Temp: %.1f C  Hum: %.1f %%", t, h);
  tft.setCursor(0, 20);
  tft.printf("AQI: %d  Rain: %d%%", aqi, rainStatus);
  tft.setCursor(0, 40);
  tft.printf("Pwr: %.1f mW  Vol: %.2f V", power_mW, busvoltage);
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wiring-diagram-container min-h-screen bg-[#0b0e17] text-[#f8fafc] font-sans p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        .wiring-diagram-container {
          --wd-bg: #0b0e17;
          --wd-s1: #131724;
          --wd-s2: #1c2235;
          --wd-border: #1f263b;
          --wd-border2: #2d3753;
          --wd-green: #10b981;
          --wd-red: #ef4444;
          --wd-yellow: #f59e0b;
          --wd-blue: #3b82f6;
          --wd-orange: #f97316;
          --wd-purple: #8b5cf6;
          --wd-pink: #ec4899;
          --wd-white: #f8fafc;
          --wd-dim: #64748b;
          --wd-mid: #94a3b8;
          --wd-primary: #5c4dff;
          --wd-mono: 'JetBrains Mono', monospace;
          --wd-sans: 'Outfit', sans-serif;
        }

        .wiring-diagram-container header {
          background: var(--wd-s1);
          border-bottom: 1px solid var(--wd-border);
          padding: 14px 28px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .wiring-diagram-container .logo { font-family:var(--wd-sans); font-size:20px; font-weight:800; letter-spacing:2px; color:var(--wd-white); }
        .wiring-diagram-container .logo span { color:var(--wd-primary); }
        .wiring-diagram-container .subtitle { font-family:var(--wd-mono); font-size:10px; color:var(--wd-dim); letter-spacing:2px; text-transform:uppercase; }

        .wiring-diagram-container .page { max-width:1400px; margin:0 auto; }

        /* TITLE SECTION */
        .wiring-diagram-container .wiring-title {
          font-family:var(--wd-mono);
          font-size:11px;
          letter-spacing:3px;
          color:var(--wd-dim);
          text-transform:uppercase;
          margin-bottom:20px;
          display:flex;
          align-items:center;
          gap:12px;
        }
        .wiring-diagram-container .wiring-title::after { content:''; flex:1; height:1px; background:var(--wd-border); }

        /* VIEW TOGGLE */
        .wiring-diagram-container .view-toggle {
          display: flex;
          background: var(--wd-s2);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--wd-border);
        }
        .wiring-diagram-container .toggle-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-family: var(--wd-mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--wd-dim);
        }
        .wiring-diagram-container .toggle-btn.active {
          background: var(--wd-primary);
          color: var(--wd-white);
        }

        /* MAIN GRID */
        .wiring-diagram-container .grid-layout { display:grid; grid-template-columns:1fr 300px 1fr; gap:16px; align-items:start; }
        @media (max-width: 1024px) {
          .wiring-diagram-container .grid-layout { grid-template-columns: 1fr; }
        }

        /* CODE BLOCK */
        .wiring-diagram-container .code-block {
          background: var(--wd-s1);
          border: 1px solid var(--wd-border);
          border-radius: 12px;
          padding: 24px;
          font-family: var(--wd-mono);
          font-size: 12px;
          line-height: 1.6;
          color: #a9b7c6;
          overflow-x: auto;
          position: relative;
        }
        .wiring-diagram-container .copy-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--wd-s2);
          border: 1px solid var(--wd-border);
          color: var(--wd-primary);
          padding: 8px 12px;
          border-radius: 6px;
          font-family: var(--wd-mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .wiring-diagram-container .copy-btn:hover {
          background: var(--wd-border);
        }

        /* ESP32 CENTER */
        .wiring-diagram-container .esp-card {
          background: var(--wd-s1);
          border: 2px solid var(--wd-primary);
          border-radius:14px;
          padding:16px;
          box-shadow: 0 0 30px rgba(92, 77, 255, 0.15);
          position: sticky;
          top: 20px;
        }

        .wiring-diagram-container .esp-title {
          font-family:var(--wd-mono);
          font-size:13px;
          font-weight:700;
          color:var(--wd-primary);
          text-align:center;
          letter-spacing:2px;
          margin-bottom:6px;
        }
        .wiring-diagram-container .esp-sub {
          font-family:var(--wd-mono);
          font-size:9px;
          color:var(--wd-dim);
          text-align:center;
          letter-spacing:2px;
          margin-bottom:14px;
        }

        .wiring-diagram-container .pin-row {
          display:flex;
          align-items:center;
          gap:6px;
          padding:4px 8px;
          border-radius:6px;
          background: var(--wd-s2);
          border: 1px solid var(--wd-border);
          margin-bottom: 4px;
        }

        .wiring-diagram-container .pin-num {
          font-family:var(--wd-mono);
          font-size:9px;
          font-weight:700;
          width:52px;
          color:var(--wd-mid);
          flex-shrink:0;
        }

        .wiring-diagram-container .pin-dot {
          width:8px; height:8px;
          border-radius:50%;
          flex-shrink:0;
        }

        .wiring-diagram-container .pin-label {
          font-family:var(--wd-mono);
          font-size:9px;
          color:var(--wd-white);
          flex:1;
        }

        /* SENSOR CARDS */
        .wiring-diagram-container .sensor-col { display:flex; flex-direction:column; gap:12px; }

        .wiring-diagram-container .sensor-card {
          background: var(--wd-s1);
          border: 1px solid var(--wd-border);
          border-radius:10px;
          overflow:hidden;
          transition: border-color 0.2s;
        }

        .wiring-diagram-container .sensor-card:hover { border-color: var(--wd-border2); }

        .wiring-diagram-container .sc-head {
          display:flex;
          align-items:center;
          gap:8px;
          padding:9px 12px 8px;
          border-bottom:1px solid var(--wd-border);
        }

        .wiring-diagram-container .sc-icon { font-size:14px; }
        .wiring-diagram-container .sc-name { font-family:var(--wd-mono); font-size:11px; font-weight:700; color:var(--wd-white); flex:1; }
        .wiring-diagram-container .sc-part { font-family:var(--wd-mono); font-size:9px; color:var(--wd-dim); }

        .wiring-diagram-container .sc-pins { padding:6px 0; }

        .wiring-diagram-container .sc-pin {
          display:flex;
          align-items:center;
          gap:8px;
          padding:4px 12px;
        }

        .wiring-diagram-container .wire-dot {
          width:7px; height:7px;
          border-radius:50%;
          flex-shrink:0;
        }

        .wiring-diagram-container .sp-from {
          font-family:var(--wd-mono);
          font-size:9px;
          color:var(--wd-mid);
          width:50px;
          flex-shrink:0;
        }

        .wiring-diagram-container .sp-arrow { color:var(--wd-dim); font-size:10px; }

        .wiring-diagram-container .sp-to {
          font-family:var(--wd-mono);
          font-size:9px;
          color:var(--wd-white);
          flex:1;
        }

        .wiring-diagram-container .sc-note {
          padding:4px 12px 8px;
          font-family:var(--wd-mono);
          font-size:9px;
          color:var(--wd-dim);
          line-height:1.5;
        }

        /* WIRE COLORS */
        .wiring-diagram-container .w-red    { background:#ef4444; }
        .wiring-diagram-container .w-black  { background:#1c2235; border:1px solid #2d3753; }
        .wiring-diagram-container .w-yellow { background:#f59e0b; }
        .wiring-diagram-container .w-green  { background:#10b981; }
        .wiring-diagram-container .w-blue   { background:#3b82f6; }
        .wiring-diagram-container .w-orange { background:#f97316; }
        .wiring-diagram-container .w-purple { background:#8b5cf6; }
        .wiring-diagram-container .w-pink   { background:#ec4899; }
        .wiring-diagram-container .w-white  { background:#f8fafc; }
        .wiring-diagram-container .w-dim    { background:#64748b; }
        .wiring-diagram-container .w-cyan   { background:#14b8a6; }

        /* COLOR LEGEND */
        .wiring-diagram-container .legend {
          background: var(--wd-s1);
          border: 1px solid var(--wd-border);
          border-radius:10px;
          padding:16px;
          margin-top:16px;
        }

        .wiring-diagram-container .legend-title {
          font-family:var(--wd-mono);
          font-size:9px;
          letter-spacing:2px;
          color:var(--wd-dim);
          text-transform:uppercase;
          margin-bottom:10px;
        }

        .wiring-diagram-container .legend-grid { display:flex; flex-wrap:wrap; gap:8px; }

        .wiring-diagram-container .legend-item {
          display:flex;
          align-items:center;
          gap:6px;
          font-family:var(--wd-mono);
          font-size:10px;
          color:var(--wd-mid);
        }

        /* I2C NOTE */
        .wiring-diagram-container .i2c-note {
          grid-column:1 / 4;
          background: var(--wd-s1);
          border: 1px solid var(--wd-border2);
          border-left: 3px solid var(--wd-blue);
          border-radius:8px;
          padding:12px 16px;
          font-family:var(--wd-mono);
          font-size:10px;
          color:var(--wd-mid);
          line-height:1.8;
        }
        @media (max-width: 1024px) {
          .wiring-diagram-container .i2c-note { grid-column: 1; }
        }

        .wiring-diagram-container .i2c-note strong { color:var(--wd-blue); }

        /* POWER TABLE */
        .wiring-diagram-container .power-table {
          grid-column:1 / 4;
          background: var(--wd-s1);
          border: 1px solid var(--wd-border);
          border-radius:10px;
          overflow:hidden;
        }
        @media (max-width: 1024px) {
          .wiring-diagram-container .power-table { grid-column: 1; }
        }

        .wiring-diagram-container .pt-head {
          display:grid;
          grid-template-columns:180px 100px 100px 1fr;
          padding:8px 16px;
          background: var(--wd-s2);
          border-bottom:1px solid var(--wd-border);
        }

        .wiring-diagram-container .pt-col {
          font-family:var(--wd-mono);
          font-size:9px;
          letter-spacing:1px;
          text-transform:uppercase;
          color:var(--wd-dim);
        }

        .wiring-diagram-container .pt-row {
          display:grid;
          grid-template-columns:180px 100px 100px 1fr;
          padding:7px 16px;
          border-bottom:1px solid var(--wd-border);
          transition:background 0.15s;
        }

        .wiring-diagram-container .pt-row:last-child { border-bottom:none; }
        .wiring-diagram-container .pt-row:hover { background:var(--wd-s2); }

        .wiring-diagram-container .pt-cell {
          font-family:var(--wd-mono);
          font-size:10px;
          color:var(--wd-white);
          display:flex;
          align-items:center;
          gap:6px;
        }

        .wiring-diagram-container .pt-cell.dim { color:var(--wd-mid); }
        .wiring-diagram-container .c-green { color: var(--wd-green); }
        .wiring-diagram-container .c-red { color: var(--wd-red); }
      `}</style>

      <header>
        <div className="logo">GEOSENSE<span>PRO</span></div>
        <div className="subtitle">Wiring Diagram — Node v2.0</div>
        <div className="flex items-center gap-4">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'wiring' ? 'active' : ''}`}
              onClick={() => setViewMode('wiring')}
            >
              Diagram
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
              onClick={() => setViewMode('code')}
            >
              Firmware Code
            </button>
          </div>
        </div>
      </header>

      <div className="page">
        <div className="wiring-title">
          {viewMode === 'wiring' ? 'Complete Sensor Wiring Map' : 'ESP32 Firmware (Arduino C++)'}
        </div>

        {viewMode === 'code' ? (
          <div className="code-block">
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
            <pre>{firmwareCode}</pre>
          </div>
        ) : (
          <div className="grid-layout">

          {/* LEFT COLUMN: Environmental & Water */}
          <div className="sensor-col">

            {/* DHT22 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🌡️</div>
                <div className="sc-name">DHT22</div>
                <div className="sc-part">Temp + Humidity</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-yellow"></div><div className="sp-from">DATA</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 25</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
              </div>
              <div className="sc-note">Moved to GPIO 25 to avoid conflict with TFT RST.</div>
            </div>

            {/* MQ-135 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">😷</div>
                <div className="sc-name">MQ-135</div>
                <div className="sc-part">Air Quality</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">5V (VIN)</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-orange"></div><div className="sp-from">AOUT</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 34</div></div>
              </div>
              <div className="sc-note">Requires 5V. Pre-heat for 24h for best accuracy.</div>
            </div>

            {/* HC-SR04 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🌊</div>
                <div className="sc-name">HC-SR04</div>
                <div className="sc-part">Ultrasonic Level</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">5V (VIN)</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-cyan"></div><div className="sp-from">TRIG</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 12</div></div>
                <div className="sc-pin"><div className="wire-dot w-green"></div><div className="sp-from">ECHO</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 13</div></div>
              </div>
              <div className="sc-note">Moved to 12/13 to free up SPI pins. Use voltage divider on ECHO (5V→3.3V).</div>
            </div>

            {/* Rain Sensor */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🌧️</div>
                <div className="sc-name">Rain Sensor</div>
                <div className="sc-part">Precipitation</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-orange"></div><div className="sp-from">AO</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 32</div></div>
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🌱</div>
                <div className="sc-name">Capacitive Soil</div>
                <div className="sc-part">Moisture</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-orange"></div><div className="sp-from">AOUT</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 33</div></div>
              </div>
            </div>

            {/* TDS */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🧪</div>
                <div className="sc-name">TDS Sensor</div>
                <div className="sc-part">Water Quality</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-orange"></div><div className="sp-from">AOUT</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 35</div></div>
              </div>
            </div>

            {/* pH Sensor */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">⚗️</div>
                <div className="sc-name">pH Sensor</div>
                <div className="sc-part">Acidity</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">5V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-orange"></div><div className="sp-from">PO</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 36 (VP)</div></div>
              </div>
            </div>

            {/* Turbidity */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🌫️</div>
                <div className="sc-name">Turbidity</div>
                <div className="sc-part">Clarity</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">5V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-orange"></div><div className="sp-from">OUT</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 39 (VN)</div></div>
              </div>
            </div>

          </div>

          {/* CENTER: ESP32 */}
          <div className="esp-card">
            <div className="esp-title">ESP32</div>
            <div className="esp-sub">DEVKIT V1 · 38 PIN</div>

            <div className="pin-row" style={{background:'#10b98112', borderColor:'#10b98133'}}>
              <div className="pin-num" style={{color:'var(--wd-green)'}}>3.3V</div>
              <div className="pin-dot" style={{background:'var(--wd-red)'}}></div>
              <div className="pin-label">Power Out (3.3V)</div>
            </div>
            <div className="pin-row" style={{background:'#10b98112', borderColor:'#10b98133'}}>
              <div className="pin-num" style={{color:'var(--wd-green)'}}>VIN / 5V</div>
              <div className="pin-dot w-red"></div>
              <div className="pin-label">USB 5V Power Out</div>
            </div>
            <div className="pin-row">
              <div className="pin-num">GND</div>
              <div className="pin-dot w-black"></div>
              <div className="pin-label">Common Ground</div>
            </div>

            <div style={{height:'8px'}}></div>
            <div style={{fontFamily:'var(--wd-mono)', fontSize:'8px', letterSpacing:'1px', color:'var(--wd-dim)', textTransform:'uppercase', marginBottom:'6px'}}>Digital / I2C / SPI</div>

            <div className="pin-row"><div className="pin-num">GPIO 21</div><div className="pin-dot w-blue"></div><div className="pin-label">I2C SDA (Shared)</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 22</div><div className="pin-dot w-blue"></div><div className="pin-label">I2C SCL (Shared)</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 23</div><div className="pin-dot w-white"></div><div className="pin-label">TFT MOSI</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 18</div><div className="pin-dot w-green"></div><div className="pin-label">TFT CLK</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 15</div><div className="pin-dot w-purple"></div><div className="pin-label">TFT CS</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 2</div><div className="pin-dot w-purple"></div><div className="pin-label">TFT DC</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 4</div><div className="pin-dot w-yellow"></div><div className="pin-label">TFT RST</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 25</div><div className="pin-dot w-yellow"></div><div className="pin-label">DHT22 DATA</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 12</div><div className="pin-dot w-cyan"></div><div className="pin-label">HC-SR04 TRIG</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 13</div><div className="pin-dot w-green"></div><div className="pin-label">HC-SR04 ECHO</div></div>

            <div style={{height:'8px'}}></div>
            <div style={{fontFamily:'var(--wd-mono)', fontSize:'8px', letterSpacing:'1px', color:'var(--wd-dim)', textTransform:'uppercase', marginBottom:'6px'}}>UART (Serial)</div>
            <div className="pin-row"><div className="pin-num">GPIO 16</div><div className="pin-dot w-pink"></div><div className="pin-label">GPS RX (RX2)</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 17</div><div className="pin-dot w-pink"></div><div className="pin-label">GPS TX (TX2)</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 26</div><div className="pin-dot w-pink"></div><div className="pin-label">GSM RX</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 27</div><div className="pin-dot w-pink"></div><div className="pin-label">GSM TX</div></div>

            <div style={{height:'8px'}}></div>
            <div style={{fontFamily:'var(--wd-mono)', fontSize:'8px', letterSpacing:'1px', color:'var(--wd-dim)', textTransform:'uppercase', marginBottom:'6px'}}>ADC (Input Only)</div>

            <div className="pin-row"><div className="pin-num">GPIO 34</div><div className="pin-dot w-orange"></div><div className="pin-label">MQ-135</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 35</div><div className="pin-dot w-orange"></div><div className="pin-label">TDS Sensor</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 32</div><div className="pin-dot w-orange"></div><div className="pin-label">Rain Sensor</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 33</div><div className="pin-dot w-orange"></div><div className="pin-label">Soil Moisture</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 36</div><div className="pin-dot w-orange"></div><div className="pin-label">pH Sensor (VP)</div></div>
            <div className="pin-row"><div className="pin-num">GPIO 39</div><div className="pin-dot w-orange"></div><div className="pin-label">Turbidity (VN)</div></div>

          </div>

          {/* RIGHT COLUMN: I2C & Comms */}
          <div className="sensor-col">

            {/* MPU6050 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🌍</div>
                <div className="sc-name">MPU6050</div>
                <div className="sc-part">Gyro/Accel</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SDA</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 21</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SCL</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 22</div></div>
              </div>
              <div className="sc-note">Addr: 0x68</div>
            </div>

            {/* ADXL345 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">📡</div>
                <div className="sc-name">ADXL345</div>
                <div className="sc-part">Seismic Accel</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SDA</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 21</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SCL</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 22</div></div>
              </div>
              <div className="sc-note">Addr: 0x53 (CS to 3.3V)</div>
            </div>

            {/* BH1750 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">☀️</div>
                <div className="sc-name">BH1750</div>
                <div className="sc-part">Light Sensor</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SDA</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 21</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SCL</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 22</div></div>
              </div>
              <div className="sc-note">Addr: 0x23</div>
            </div>

            {/* INA219 */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">⚡</div>
                <div className="sc-name">INA219</div>
                <div className="sc-part">Power Monitor</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SDA</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 21</div></div>
                <div className="sc-pin"><div className="wire-dot w-blue"></div><div className="sp-from">SCL</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 22</div></div>
              </div>
              <div className="sc-note">Addr: 0x40</div>
            </div>

            {/* GPS */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🛰️</div>
                <div className="sc-name">GY-NEO6MV2</div>
                <div className="sc-part">GPS Module</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-pink"></div><div className="sp-from">TX</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 16</div></div>
                <div className="sc-pin"><div className="wire-dot w-pink"></div><div className="sp-from">RX</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 17</div></div>
              </div>
            </div>

            {/* GSM */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">📶</div>
                <div className="sc-name">SIM800L / NB-IoT</div>
                <div className="sc-part">Cellular</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">5V (Ext Pwr)</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-pink"></div><div className="sp-from">TX</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 26</div></div>
                <div className="sc-pin"><div className="wire-dot w-pink"></div><div className="sp-from">RX</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 27</div></div>
              </div>
              <div className="sc-note">⚠ Needs external 2A power supply. Share GND with ESP32.</div>
            </div>

            {/* TFT */}
            <div className="sensor-card">
              <div className="sc-head">
                <div className="sc-icon">🖥️</div>
                <div className="sc-name">2.8" TFT SPI</div>
                <div className="sc-part">ILI9341</div>
              </div>
              <div className="sc-pins">
                <div className="sc-pin"><div className="wire-dot w-red"></div><div className="sp-from">VCC</div><div className="sp-arrow">→</div><div className="sp-to">3.3V</div></div>
                <div className="sc-pin"><div className="wire-dot w-black"></div><div className="sp-from">GND</div><div className="sp-arrow">→</div><div className="sp-to">GND</div></div>
                <div className="sc-pin"><div className="wire-dot w-white"></div><div className="sp-from">MOSI</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 23</div></div>
                <div className="sc-pin"><div className="wire-dot w-green"></div><div className="sp-from">CLK</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 18</div></div>
                <div className="sc-pin"><div className="wire-dot w-purple"></div><div className="sp-from">CS</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 15</div></div>
                <div className="sc-pin"><div className="wire-dot w-purple"></div><div className="sp-from">DC</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 2</div></div>
                <div className="sc-pin"><div className="wire-dot w-yellow"></div><div className="sp-from">RST</div><div className="sp-arrow">→</div><div className="sp-to">GPIO 4</div></div>
              </div>
            </div>

          </div>

          {/* I2C NOTE */}
          <div className="i2c-note">
            <strong>I2C BUS NOTE</strong> — MPU6050 (0x68), ADXL345 (0x53), BH1750 (0x23), and INA219 (0x40) all share GPIO 21 (SDA) and GPIO 22 (SCL). This is normal.
          </div>

          {/* POWER TABLE */}
          <div className="power-table">
            <div style={{padding:'10px 16px 8px', borderBottom:'1px solid var(--wd-border)'}}>
              <div style={{fontFamily:'var(--wd-mono)', fontSize:'9px', letterSpacing:'2px', color:'var(--wd-dim)', textTransform:'uppercase'}}>Power Supply Summary</div>
            </div>
            <div className="pt-head">
              <div className="pt-col">Component</div>
              <div className="pt-col">Voltage</div>
              <div className="pt-col">Current</div>
              <div className="pt-col">Source</div>
            </div>
            <div className="pt-row"><div className="pt-cell">ESP32 DevKit</div><div className="pt-cell c-green">3.3V / 5V</div><div className="pt-cell">~240mA</div><div className="pt-cell dim">USB</div></div>
            <div className="pt-row"><div className="pt-cell">GSM / NB-IoT</div><div className="pt-cell c-red">5V</div><div className="pt-cell">~2000mA</div><div className="pt-cell dim">EXTERNAL PSU</div></div>
            <div className="pt-row"><div className="pt-cell">MQ-135</div><div className="pt-cell c-red">5V</div><div className="pt-cell">~150mA</div><div className="pt-cell dim">VIN (USB)</div></div>
            <div className="pt-row"><div className="pt-cell">TFT Display</div><div className="pt-cell c-green">3.3V</div><div className="pt-cell">~40mA</div><div className="pt-cell dim">ESP32 3.3V</div></div>
            <div className="pt-row"><div className="pt-cell">GPS</div><div className="pt-cell c-green">3.3V</div><div className="pt-cell">~45mA</div><div className="pt-cell dim">ESP32 3.3V</div></div>
            <div className="pt-row"><div className="pt-cell">Sensors (Rest)</div><div className="pt-cell c-green">3.3V/5V</div><div className="pt-cell">~50mA</div><div className="pt-cell dim">Mixed</div></div>
            <div className="pt-row" style={{background:'var(--wd-s2)'}}>
              <div className="pt-cell" style={{color:'var(--wd-yellow)', fontWeight:700}}>TOTAL</div>
              <div className="pt-cell" style={{color:'var(--wd-yellow)'}}>5V</div>
              <div className="pt-cell" style={{color:'var(--wd-yellow)'}}>~2.5A</div>
              <div className="pt-cell dim">Requires 5V 3A Adapter</div>
            </div>
          </div>

          {/* WIRE COLOR LEGEND */}
          <div className="legend" style={{gridColumn:'1 / 4'}}>
            <div className="legend-title">Wire Color Convention</div>
            <div className="legend-grid">
              <div className="legend-item"><div className="wire-dot w-red" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Red — VCC</div>
              <div className="legend-item"><div className="wire-dot w-black" style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1c2235', border:'1px solid #2d3753'}}></div>Black — GND</div>
              <div className="legend-item"><div className="wire-dot w-yellow" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Yellow — Data</div>
              <div className="legend-item"><div className="wire-dot w-green" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Green — CLK/Echo</div>
              <div className="legend-item"><div className="wire-dot w-blue" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Blue — I2C</div>
              <div className="legend-item"><div className="wire-dot w-orange" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Orange — Analog</div>
              <div className="legend-item"><div className="wire-dot w-purple" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Purple — Control</div>
              <div className="legend-item"><div className="wire-dot w-pink" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Pink — UART</div>
              <div className="legend-item"><div className="wire-dot w-white" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>White — MOSI</div>
              <div className="legend-item"><div className="wire-dot w-cyan" style={{width:'10px', height:'10px', borderRadius:'50%'}}></div>Cyan — Trig</div>
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
};

export default WiringDiagram;
