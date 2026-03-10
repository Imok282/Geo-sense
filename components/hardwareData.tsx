import React from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Activity, 
  Sun, 
  Wifi, 
  Cpu, 
  Radio, 
  Signal, 
  Zap, 
  Waves, 
  FlaskConical,
  Monitor,
  Navigation
} from 'lucide-react';

export interface SensorSpec {
  id: string;
  name: string;
  description: string;
  useCase: string;
  icon: any;
}

export interface SensorCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  sensors: SensorSpec[];
}

export const HARDWARE_CATALOG: SensorCategory[] = [
  {
    id: 'temp',
    title: 'Temperature & Heat',
    icon: <Thermometer />,
    color: 'bg-rose-500',
    sensors: [
      {
        id: 'dht22',
        name: 'DHT22 / DHT11',
        description: 'Measures temperature and humidity. Cheap, widely available, easy to wire to ESP32. DHT22 is more accurate.',
        useCase: 'Perfect for heatwave monitoring in schools and construction sites.',
        icon: <Thermometer />
      }
    ]
  },
  {
    id: 'air',
    title: 'Air Quality',
    icon: <Wind />,
    color: 'bg-emerald-500',
    sensors: [
      {
        id: 'mq135',
        name: 'MQ-135',
        description: 'Detects CO2, ammonia, benzene, and general air quality. Low cost, widely used.',
        useCase: 'Good for neighborhood AQI monitoring.',
        icon: <Wind />
      }
    ]
  },
  {
    id: 'water',
    title: 'Flood & Water',
    icon: <Droplets />,
    color: 'bg-blue-500',
    sensors: [
      {
        id: 'hcsr04',
        name: 'HC-SR04',
        description: 'Ultrasonic Distance Sensor. Measures water level in drains, rivers, and tanks by calculating distance to surface.',
        useCase: 'The most practical flood sensor for urban drainage monitoring.',
        icon: <Waves />
      },
      {
        id: 'rain_sensor',
        name: 'Rain Water Sensor',
        description: 'Detects the presence of rain and measures intensity. Replaces simple float switches for more accurate weather data.',
        useCase: 'Early warning for flash floods and storm tracking.',
        icon: <Droplets />
      },
      {
        id: 'soil',
        name: 'Soil Moisture (Capacitive)',
        description: 'Measures how saturated the ground is. Critical for landslide prediction.',
        useCase: 'Landslide prediction and agricultural water management.',
        icon: <Waves />
      }
    ]
  },
  {
    id: 'seismic',
    title: 'Seismic & Ground',
    icon: <Activity />,
    color: 'bg-amber-500',
    sensors: [
      {
        id: 'mpu6050',
        name: 'MPU6050',
        description: 'Accelerometer + Gyroscope. Detects vibration, tilt, and micro-tremors.',
        useCase: 'Detect abnormal ground movement patterns across neighborhoods.',
        icon: <Activity />
      },
      {
        id: 'adxl345',
        name: 'ADXL345',
        description: 'High-sensitivity accelerometer. Better for detecting very subtle seismic micro-activity.',
        useCase: 'Used in DIY earthquake detection networks worldwide.',
        icon: <Activity />
      }
    ]
  },
  {
    id: 'energy',
    title: 'Solar & Energy',
    icon: <Zap />,
    color: 'bg-yellow-400',
    sensors: [
      {
        id: 'bh1750',
        name: 'BH1750',
        description: 'Light Intensity Sensor (Lux). Useful for solar farm efficiency monitoring.',
        useCase: 'Detects dust accumulation or cloud cover affecting panel output.',
        icon: <Sun />
      },
      {
        id: 'ina219',
        name: 'INA219',
        description: 'Current & Voltage Sensor. Monitors actual power output from solar panels in real time.',
        useCase: 'Helps energy operators know exactly which panels are underperforming.',
        icon: <Zap />
      }
    ]
  },
  {
    id: 'quality',
    title: 'Water Quality',
    icon: <FlaskConical />,
    color: 'bg-cyan-500',
    sensors: [
      {
        id: 'tds',
        name: 'TDS Sensor',
        description: 'Total Dissolved Solids. Measures how contaminated water is by dissolved chemicals and minerals.',
        useCase: 'Critical for monitoring water sources near industrial zones.',
        icon: <Droplets />
      },
      {
        id: 'ph',
        name: 'pH Sensor',
        description: 'Measures water acidity. Detects chemical pollution in rivers, lakes, and agricultural water sources.',
        useCase: 'Real-time chemical pollution detection.',
        icon: <Droplets />
      },
      {
        id: 'turbidity',
        name: 'Turbidity Sensor',
        description: 'Measures how murky water is — a direct indicator of contamination or flood sediment levels.',
        useCase: 'Useful for post-flood water safety assessment.',
        icon: <Waves />
      }
    ]
  },
  {
    id: 'connect',
    title: 'Connectivity & Location',
    icon: <Wifi />,
    color: 'bg-indigo-500',
    sensors: [
      {
        id: 'wifi',
        name: 'ESP32 Built-in WiFi',
        description: 'Sends all sensor data to the cloud in real time wherever WiFi is available.',
        useCase: 'Good for urban deployments.',
        icon: <Wifi />
      },
      {
        id: 'gyneo6mv2',
        name: 'GY-NEO6MV2 GPS',
        description: 'Satellite positioning module. Provides accurate latitude, longitude, and altitude data.',
        useCase: 'Essential for mobile sensor nodes and asset tracking.',
        icon: <Navigation />
      },
      {
        id: 'gsm',
        name: 'SIM800L / SIM7600 (GSM)',
        description: 'Adds cellular connectivity to ESP32. Sends data and SMS alerts over any mobile network.',
        useCase: 'Critical for rural deployments, forest monitoring, and landslide zones.',
        icon: <Signal />
      },
      {
        id: 'nbiot',
        name: 'NB-IoT Module',
        description: 'Narrowband IoT — uses very little power and works on existing mobile infrastructure.',
        useCase: 'Ideal for large-scale deployments across hundreds of sensors.',
        icon: <Cpu />
      }
    ]
  },
  {
    id: 'display',
    title: 'Display & Interface',
    icon: <Monitor />,
    color: 'bg-purple-500',
    sensors: [
      {
        id: 'tft28',
        name: '2.8" TFT SPI 240x320',
        description: 'Full color display for local data visualization. ILI9341 driver.',
        useCase: 'Show real-time metrics to on-site personnel without needing a phone.',
        icon: <Monitor />
      }
    ]
  }
];
