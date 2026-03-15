/*
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║  GeoSense Pro — Water Intelligence Node  v2.0                     ║
 * ║  Platform  : ESP32 (any variant)                                  ║
 * ║  Sensors   : TDS Probe  — GPIO 35 (analog)                        ║
 * ║              HC-SR04 #1 — Drain Overflow  TRIG GPIO 5 / ECHO 18   ║
 * ║              HC-SR04 #2 — Tank Level      TRIG GPIO 19 / ECHO 23  ║
 * ║  Transport : WiFi Station → HTTPS PUT → Firebase RTDB             ║
 * ║  Dashboard : https://geosense-pro-ai.web.app                      ║
 * ╚════════════════════════════════════════════════════════════════════╝
 *
 *  Architecture
 *  ─────────────────────────────────────────────────────────────────────
 *  ESP32  ─── HTTPS PUT ──►  Firebase RTDB (nodes/water_node)
 *                                    │
 *                                    ▼  (onValue stream)
 *                         React Web App (geosense-pro-ai.web.app)
 *
 *  Wiring
 *  ─────────────────────────────────────────────────────────────────────
 *  TDS Sensor
 *    AOUT  ──► GPIO 35   (ADC1_CH7)
 *    VCC   ──► 3.3 V
 *    GND   ──► GND
 *    Note: if probe board outputs up to 5 V, use 10k/10k voltage divider.
 *
 *  HC-SR04 #1  Drain Overflow
 *    TRIG  ──► GPIO 5
 *    ECHO  ──► GPIO 18   (5 V — use 1kΩ+2kΩ divider or level-shifter)
 *    VCC   ──► 5 V
 *    GND   ──► GND
 *
 *  HC-SR04 #2  Tank Level
 *    TRIG  ──► GPIO 19
 *    ECHO  ──► GPIO 23   (5 V — same level-shift as above)
 *    VCC   ──► 5 V
 *    GND   ──► GND
 *
 *  Setup Steps
 *  ─────────────────────────────────────────────────────────────────────
 *  1. Fill in WIFI_SSID / WIFI_PASS below.
 *  2. Get your Firebase Database Secret:
 *       Firebase Console → Project Settings → Service Accounts
 *       → Database Secrets → Show / Add Secret
 *  3. Paste the secret into DB_SECRET below.
 *  4. Verify DB_URL matches your Realtime Database URL
 *       (Firebase Console → Realtime Database → Data → copy URL from top)
 *  5. Set RTDB rules (see below) then flash to ESP32.
 *  6. Open Serial Monitor at 115200 baud — node prints push status.
 *  7. Open https://geosense-pro-ai.web.app — data appears within 5 s.
 *
 *  Firebase RTDB Rules  (Realtime Database → Rules tab)
 *  ─────────────────────────────────────────────────────────────────────
 *  {
 *    "rules": {
 *      "nodes": {
 *        "water_node": {
 *          ".read":  true,
 *          ".write": "auth != null"
 *        }
 *      }
 *    }
 *  }
 *  The legacy DB_SECRET authenticates the ESP32 via ?auth= query param.
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// ─── USER CONFIGURATION ───────────────────────────────────────────────────────

const char* WIFI_SSID  = "YOUR_WIFI_SSID";           // ← your network name
const char* WIFI_PASS  = "YOUR_WIFI_PASSWORD";        // ← your network password

// Firebase Realtime Database URL
// Format: https://<project-id>-default-rtdb.firebaseio.com
// (Check Firebase Console → Realtime Database → Data)
const char* DB_URL     = "https://geosense-pro-ai-default-rtdb.firebaseio.com";

// Legacy database secret
// Firebase Console → Project Settings → Service Accounts → Database Secrets
const char* DB_SECRET  = "YOUR_DATABASE_SECRET";      // ← paste here

// Push interval in milliseconds
const unsigned long PUSH_INTERVAL = 5000;              // 5 seconds

// ─── SENSOR PINS ─────────────────────────────────────────────────────────────
#define TDS_PIN       35
#define DRAIN_TRIG     5
#define DRAIN_ECHO    18
#define TANK_TRIG     19
#define TANK_ECHO     23

// ─── CALIBRATION ─────────────────────────────────────────────────────────────
#define TDS_VREF      3.3f
#define TDS_ADC_MAX   4095.0f
#define TDS_SAMPLES   10
#define TDS_TEMP      25.0f     // assumed water temperature for compensation (°C)
#define SONAR_TIMEOUT 30000     // µs — max echo wait (~5 m range)
#define SONAR_MIN_CM  1.0f      // reject shorter echoes (noise)
#define SONAR_MAX_CM  400.0f    // reject longer echoes (out of range)

// ─── GLOBALS ─────────────────────────────────────────────────────────────────
unsigned long lastPush = 0;
unsigned long bootTime = 0;

// ─── TDS READING ─────────────────────────────────────────────────────────────
float readTDS() {
  long sum = 0;
  for (int i = 0; i < TDS_SAMPLES; i++) {
    sum += analogRead(TDS_PIN);
    delay(8);
  }
  float voltage = ((float)sum / TDS_SAMPLES) * TDS_VREF / TDS_ADC_MAX;
  // Temperature compensation
  float compV   = voltage / (1.0f + 0.02f * (TDS_TEMP - 25.0f));
  // Empirical DFRobot-style polynomial (ppm)
  float tds     = (133.42f * compV * compV * compV
                 - 255.86f * compV * compV
                 +  857.39f * compV) * 0.5f;
  return max(0.0f, tds);
}

// ─── ULTRASONIC READING ───────────────────────────────────────────────────────
float readDistance(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long dur = pulseIn(echoPin, HIGH, SONAR_TIMEOUT);
  if (dur == 0) return -1.0f;
  float d = (float)dur * 0.0343f / 2.0f;
  return (d < SONAR_MIN_CM || d > SONAR_MAX_CM) ? -1.0f : d;
}

// ─── PUSH TO FIREBASE RTDB ───────────────────────────────────────────────────
void pushToFirebase() {
  float tds = readTDS();
  float w1  = readDistance(DRAIN_TRIG, DRAIN_ECHO);
  float w2  = readDistance(TANK_TRIG,  TANK_ECHO);
  unsigned long uptime = (millis() - bootTime) / 1000UL;
  int   rssi = WiFi.RSSI();

  // Full PUT URL with legacy auth
  String url = String(DB_URL) + "/nodes/water_node.json?auth=" + String(DB_SECRET);

  // JSON body — {".sv":"timestamp"} tells Firebase to set the server timestamp
  char body[220];
  snprintf(body, sizeof(body),
    "{\"tds\":%.1f,\"w1\":%.1f,\"w2\":%.1f,"
    "\"uptime\":%lu,\"rssi\":%d,"
    "\"ts\":{\".sv\":\"timestamp\"}}",
    tds, w1, w2, uptime, rssi);

  WiFiClientSecure client;
  client.setInsecure();   // Skip TLS cert check — acceptable for IoT telemetry

  HTTPClient http;
  if (!http.begin(client, url)) {
    Serial.println("[PUSH]  HTTPClient.begin() failed");
    return;
  }
  http.addHeader("Content-Type", "application/json");

  int code = http.PUT(String(body));

  if (code == 200 || code == 204) {
    Serial.printf("[PUSH]  OK (%d)  TDS=%.1fppm  W1=%.1fcm  W2=%.1fcm  UP=%lus\n",
                  code, tds, w1, w2, uptime);
  } else {
    Serial.printf("[PUSH]  FAIL (%d) — %s\n", code, http.errorToString(code).c_str());
  }
  http.end();
}

// ─── WIFI RECONNECT ───────────────────────────────────────────────────────────
void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("[WIFI]  Reconnecting");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  for (uint8_t i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) {
    delay(500); Serial.print('.');
  }
  Serial.println(WiFi.status() == WL_CONNECTED ? "\n[WIFI]  Reconnected" : "\n[WIFI]  Reconnect failed");
}

// ─── SETUP ───────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\n[BOOT]  GeoSense Pro — Water Intelligence Node v2.0");
  Serial.println("[BOOT]  Target: " + String(DB_URL) + "/nodes/water_node");

  // Pin init
  pinMode(DRAIN_TRIG, OUTPUT); digitalWrite(DRAIN_TRIG, LOW);
  pinMode(DRAIN_ECHO, INPUT);
  pinMode(TANK_TRIG,  OUTPUT); digitalWrite(TANK_TRIG,  LOW);
  pinMode(TANK_ECHO,  INPUT);
  // TDS is ADC — no pinMode needed

  // WiFi station mode
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WIFI]  Connecting to %s", WIFI_SSID);
  for (uint8_t i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) {
    delay(500); Serial.print('.');
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI]  Connected — IP: %s  RSSI: %d dBm\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.println("\n[WIFI]  Connection failed — check SSID / PASSWORD");
  }

  bootTime = millis();
  Serial.println("[READY] Pushing every " + String(PUSH_INTERVAL / 1000) + " s  →  geosense-pro-ai.web.app\n");
}

// ─── LOOP ────────────────────────────────────────────────────────────────────
void loop() {
  if (millis() - lastPush >= PUSH_INTERVAL) {
    lastPush = millis();
    ensureWiFi();
    if (WiFi.status() == WL_CONNECTED) pushToFirebase();
  }
  delay(20);
}
