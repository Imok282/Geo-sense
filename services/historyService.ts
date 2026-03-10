
import { SensorData } from "../types";

const HISTORY_KEY = 'geosense_7day_history';

export interface HistoryPoint {
  date: string;
  temp: number;
  aqi: number;
  humidity: number;
}

export const saveDailySnapshot = (data: SensorData) => {
  const history = getHistory();
  const today = new Date().toLocaleDateString();
  
  // Find if we already have a record for today to update it (average-like behavior)
  const existingIdx = history.findIndex(h => h.date === today);
  
  const newPoint: HistoryPoint = {
    date: today,
    temp: data.temperature,
    aqi: data.aqi,
    humidity: data.humidity
  };

  if (existingIdx >= 0) {
    // Basic smoothing/averaging for the day
    const old = history[existingIdx];
    history[existingIdx] = {
      date: today,
      temp: Number(((old.temp + data.temperature) / 2).toFixed(1)),
      aqi: Math.round((old.aqi + data.aqi) / 2),
      humidity: Math.round((old.humidity + data.humidity) / 2)
    };
  } else {
    history.push(newPoint);
  }

  // Keep only last 7 days
  const trimmed = history.slice(-7);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
};

export const getHistory = (): HistoryPoint[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};
