
export interface GeoSenseData {
  temperature: number;
  humidity: number;
  aqi: number;
  aqi_raw: number;
  water_level_pct: number;
  water_dist_cm: number;
  tds_ppm: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  vibration_g: number;
  adxl_x: number;
  adxl_y: number;
  adxl_z: number;
  gps_lat: number;
  gps_lng: number;
  gps_alt: number;
  gps_fix: boolean;
  gps_satellites: number;
  uptime_sec: number;
  wifi_rssi: number;
  dht_ok: boolean;
  mpu_ok: boolean;
  adxl_ok: boolean;
}

export enum RiskLevel {
  SAFE = 'SAFE',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH'
}

export type SensorCategory = 
  | 'THERMAL' 
  | 'AIR_QUALITY' 
  | 'WATER' 
  | 'SEISMIC' 
  | 'ENERGY' 
  | 'CONNECTIVITY'
  | 'DISPLAY';

export type SensorModel = 
  // Thermal
  | 'DHT22' | 'DHT11' | 'DS18B20' | 'MLX90614'
  // Air Quality
  | 'MQ-135' | 'MQ-7' | 'PMS5003' | 'PMS7003' | 'SDS011' | 'MiCS-6814'
  // Water
  | 'HC-SR04' | 'RAIN_SENSOR' | 'CAPACITIVE_SOIL' | 'TDS_METER' | 'PH_METER' | 'TURBIDITY' | 'FLOAT_LEVEL' | 'RAIN_GAUGE'
  // Seismic
  | 'MPU6050' | 'ADXL345' | 'SW-420'
  // Energy
  | 'INA219' | 'BH1750'
  // Connectivity
  | 'WIFI_BUILTIN' | 'SIM800L' | 'SIM7600' | 'NB_IOT' | 'NEO6MV2' | 'LORA_RA02'
  // Display
  | 'TFT_ILI9341';

export interface SensorConfig {
  id: string;
  model: SensorModel;
  category: SensorCategory;
  count: number;
  isActive: boolean;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  aqi: number;
  rainfall: number;
  rainStatus: 'None' | 'Light' | 'Heavy';
  timestamp: string;
  
  // Extended Sensor Data
  waterLevel?: number; // cm
  soilMoisture?: number; // %
  vibration?: number; // g
  tilt?: number; // degrees
  luminosity?: number; // lux
  surfaceTemp?: number;
  sound?: number;
  voc?: number;
  
  // Energy (INA219)
  voltage?: number; // V
  current?: number; // mA
  power?: number; // mW
  
  // Gas Details (MQ-135 estimates)
  co2?: number; // ppm
  nh3?: number; // ppm
  benzene?: number; // ppm
  ammonia?: number;
  co?: number;
  pm25?: number;
  pm10?: number;
  
  // Water Quality
  tds?: number; // ppm
  ph?: number; // pH
  turbidity?: number; // NTU
  
  // Connectivity
  signalStrength?: number; // dBm
  lat?: number;
  lng?: number;
  satellites?: number;
}

export interface ClimateRisk {
  type: string;
  score: number; // 0 to 100
  level: RiskLevel;
  description: string;
}

export interface TrendData {
  time: string;
  value: number;
}

export interface ComplianceMetric {
  category: string;
  score: number;
  status: 'COMPLIANT' | 'WARNING' | 'CRITICAL';
  target: string;
}

export interface NodeAnalysis {
  summary: string;
  threatLevel: RiskLevel;
  score: number;
  sources: { title: string, uri: string }[];
}

export interface MapNode {
  id: string;
  lat: number;
  lng: number;
  loading: boolean;
  analysis: NodeAnalysis | null;
  error: string | null;
  data?: SensorData;
  sensors?: SensorConfig[]; // New field for sensor configuration
  name?: string;
  sensorType?: string;
  sensorCategory?: string;
}

export interface SustainabilityReport {
  overallScore: number;
  metrics: ComplianceMetric[];
  roadmap: string[];
}

// ─── NODE TYPES ───────────────────────────────────────────────────────────────
/** Physical ESP32 node variant the browser is currently connected to */
export type NodeType = 'water' | 'air' | 'climate' | 'seismic';

// ─── HARDWARE NODE TYPES (Water Intelligence Node) ───────────────────────────

/** Raw JSON payload from ESP32 BLE notification */
export interface LiveData {
  tds: number;      // ppm  — TDS sensor (GPIO 35)
  w1: number;       // cm   — HC-SR04 #1 drain overflow (GPIO 5/18), -1 = no echo
  w2: number;       // cm   — HC-SR04 #2 tank level (GPIO 19/23),    -1 = no echo
  uptime: number;   // seconds since boot
  rssi: number;     // dBm  — WiFi signal strength
}

/** Rolling history arrays (max 30 readings each) */
export interface HistoryData {
  tds: number[];
  w1: number[];
  w2: number[];
}

/** Heuristic risk scores derived locally from LiveData (0–100 each) */
export interface RiskScores {
  tds: number;       // water contamination risk
  flood: number;     // combined flood risk (drain + tank weighted)
  drain: number;     // drain overflow risk from HC-SR04 #1
  tank: number;      // tank fill percentage (higher = more full)
  composite: number; // overall node risk
}
