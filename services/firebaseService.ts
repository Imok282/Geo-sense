
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, DatabaseReference } from 'firebase/database';
import { LiveData } from '../types';

// ─── FIREBASE CONFIG (from .env — copy .env.example → .env) ──────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton init — safe to call multiple times
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ─── RTDB PATH ────────────────────────────────────────────────────────────────
// The ESP32 firmware PUTs to: /nodes/water_node
// All fields: tds, w1, w2, uptime, rssi, ts (server timestamp)
const NODE_PATH = 'nodes/water_node';

// ─── SUBSCRIBE TO LIVE NODE DATA ──────────────────────────────────────────────
/**
 * Attaches a real-time listener to the water node's RTDB document.
 *
 * @param onData  — called every time the ESP32 pushes new data
 * @param onError — called if the subscription fails (e.g. permission denied)
 * @returns unsubscribe function — call on component unmount
 */
export function subscribeToNode(
  onData:  (data: LiveData) => void,
  onError: (err: Error) => void,
): () => void {
  const nodeRef: DatabaseReference = ref(db, NODE_PATH);

  // onValue returns an Unsubscribe function in Firebase v9 modular SDK
  const unsubscribe = onValue(
    nodeRef,
    (snapshot) => {
      const val = snapshot.val();
      if (val && typeof val.tds === 'number') {
        onData(val as LiveData);
      }
    },
    (error) => onError(new Error(error.message)),
  );

  return unsubscribe;
}

// ─── WRITE NODE DATA (BLE bridge) ────────────────────────────────────────────
/**
 * Writes a single LiveData snapshot to Firebase RTDB.
 * Called by the BLE bridge in App.tsx on every BLE notification.
 * Fire-and-forget: errors are logged but not re-thrown.
 */
export function writeNodeData(data: LiveData): void {
  const nodeRef = ref(db, NODE_PATH);
  set(nodeRef, { ...data, ts: Date.now() }).catch((err) => {
    console.warn('[Firebase] writeNodeData failed:', err);
  });
}

// ─── CHECK IF RTDB IS REACHABLE ───────────────────────────────────────────────
/**
 * Resolves true once the first snapshot arrives (any value, even null),
 * which confirms the Firebase connection itself is up.
 */
export function checkFirebaseReachable(): Promise<boolean> {
  return new Promise((resolve) => {
    const nodeRef = ref(db, NODE_PATH);
    const unsub = onValue(
      nodeRef,
      () => {
        off(nodeRef, 'value', unsub);
        resolve(true);
      },
      () => resolve(false),
      { onlyOnce: true },
    );
  });
}
