import { LiveData } from '../types';

// ─── BLE UUIDs (must match firmware) ─────────────────────────────────────────
const SERVICE_UUID        = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

// ─── TYPE GUARD ───────────────────────────────────────────────────────────────
function isLiveData(v: unknown): v is LiveData {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.tds    === 'number' &&
    typeof o.w1     === 'number' &&
    typeof o.w2     === 'number' &&
    typeof o.uptime === 'number'
  );
}

// ─── CONNECT & SUBSCRIBE ──────────────────────────────────────────────────────
/**
 * Opens a Web Bluetooth connection to a GeoSense node.
 *
 * @param onData        — called with each parsed LiveData notification
 * @param onDisconnect  — called when the BLE device disconnects
 * @param namePrefix    — BLE device name prefix to filter (default: 'GEOSENSE').
 *                        Pass the node-specific prefix (e.g. 'GEOSENSE-WATER')
 *                        so only the right device type appears in the browser
 *                        Bluetooth picker.
 * @returns             — async cleanup / disconnect function
 *
 * Requires: HTTPS or localhost + Chrome/Edge/Opera (not Firefox/iOS Safari).
 */
export async function connectBLE(
  onData:       (data: LiveData) => void,
  onDisconnect: () => void,
  namePrefix    = 'GEOSENSE',
): Promise<() => void> {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix }],
    optionalServices: [SERVICE_UUID],
  });

  device.addEventListener('gattserverdisconnected', () => {
    onDisconnect();
  });

  const server  = await device.gatt!.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const char    = await service.getCharacteristic(CHARACTERISTIC_UUID);

  // Read current value immediately (may not exist on first connection)
  try {
    const initial = await char.readValue();
    const text    = new TextDecoder().decode(initial);
    const parsed  = JSON.parse(text) as unknown;
    if (isLiveData(parsed)) onData(parsed);
  } catch {
    // no initial value yet — first notification will arrive shortly
  }

  // Subscribe to notifications
  await char.startNotifications();
  const handler = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    const text  = new TextDecoder().decode(value);
    try {
      const parsed = JSON.parse(text) as unknown;
      if (isLiveData(parsed)) onData(parsed);
    } catch {
      // malformed packet — ignore
    }
  };
  char.addEventListener('characteristicvaluechanged', handler);

  // Return cleanup / disconnect function
  return () => {
    char.removeEventListener('characteristicvaluechanged', handler);
    try { char.stopNotifications(); } catch { /* ignore */ }
    try { device.gatt?.disconnect(); } catch { /* ignore */ }
  };
}

// ─── AVAILABILITY CHECK ───────────────────────────────────────────────────────
/**
 * Returns true if the browser supports Web Bluetooth.
 * Requires HTTPS (or localhost) + Chrome, Edge, or Opera.
 * Firefox and iOS Safari do NOT support Web Bluetooth.
 */
export function isBLESupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}
