/*
 * GeoSense Pro -- Water Intelligence Node  v3.0  (BLE Edition)
 * Platform  : ESP32 (any BLE-capable variant)
 * Node Type : water
 * Sensors   : TDS Probe  -- GPIO 35 (ADC1_CH7)
 *             HC-SR04 #1 -- Drain Overflow  TRIG 5  / ECHO 18
 *             HC-SR04 #2 -- Tank Level      TRIG 19 / ECHO 23
 * Transport : BLE Notify (no WiFi required)
 * Bridge    : Browser Web Bluetooth API --> Firebase RTDB
 * Dashboard : https://geosense-pro-ai.web.app
 *
 * ARCHITECTURE
 * ============
 * ESP32 --BLE Notify--> Browser (Chrome/Edge Web Bluetooth)
 *                             | fire-and-forget HTTPS set()
 *                             v
 *                   Firebase RTDB  nodes/water_node
 *                             | onValue stream
 *                             v
 *                   geosense-pro-ai.web.app  (all viewers)
 *
 * BLE IDENTITY
 * ============
 * Device name  : GEOSENSE-WATER
 * Service UUID : 4fafc201-1fb5-459e-8fcc-c5c9c331914b
 * Char UUID    : beb5483e-36e1-4688-b7f5-ea07361b26a8
 * Properties   : READ | NOTIFY
 * Interval     : 5 s
 *
 * BLE PAYLOAD  (UTF-8 JSON, max ~200 bytes)
 * ==========================================
 * {"type":"water","tds":245.3,"w1":18.2,"w2":54.1,"uptime":3600,"rssi":0}
 *  type   -- node variant tag (used by dashboard to auto-select node type)
 *  tds    -- total dissolved solids, ppm
 *  w1     -- drain sensor distance, cm  (-1 = no echo / timeout)
 *  w2     -- tank sensor distance, cm   (-1 = no echo / timeout)
 *  uptime -- seconds since boot
 *  rssi   -- always 0 for BLE-only nodes (no WiFi RSSI available)
 *
 * ============================================================
 *  WIRING
 * ============================================================
 *
 *  TDS Sensor (DFRobot-style 3.3 V board)
 *  ----------------------------------------
 *  AOUT  -->  GPIO 35         (ADC input)
 *  VCC   -->  3.3 V
 *  GND   -->  GND
 *
 *  NOTE: If the probe board outputs up to 5 V, add a divider:
 *    AOUT --> 10 kOhm --> GPIO 35
 *                     |
 *                   10 kOhm
 *                     |
 *                    GND
 *
 *  HC-SR04 #1  Drain Overflow (mount above drain, pointed down)
 *  ----------------------------------------
 *  VCC   -->  5 V
 *  GND   -->  GND
 *  TRIG  -->  GPIO 5          (3.3 V output -- direct OK)
 *  ECHO  -->  1 kOhm --> GPIO 18
 *                    |
 *                  2 kOhm    (voltage divider: 5 V ECHO --> 3.3 V safe)
 *                    |
 *                   GND
 *
 *  HC-SR04 #2  Tank Level (mount on top of tank, pointed at water)
 *  ----------------------------------------
 *  VCC   -->  5 V
 *  GND   -->  GND
 *  TRIG  -->  GPIO 19         (3.3 V output -- direct OK)
 *  ECHO  -->  1 kOhm --> GPIO 23
 *                    |
 *                  2 kOhm    (same voltage divider as above)
 *                    |
 *                   GND
 *
 * ============================================================
 *  SETUP STEPS
 * ============================================================
 *  1. Arduino IDE -> Tools -> Board -> "ESP32 Dev Module"
 *  2. Library Manager -> install "ESP32 BLE Arduino"
 *  3. Flash this sketch -- no WiFi credentials needed
 *  4. Open Serial Monitor @ 115200 baud
 *     You should see:  [READY] Advertising as "GEOSENSE-WATER"
 *  5. On Chrome/Edge desktop or Android, open:
 *       https://geosense-pro-ai.web.app
 *  6. Select "Water Intelligence Node" on the connect screen
 *  7. Click "SCAN & CONNECT VIA BLE"
 *  8. Pick "GEOSENSE-WATER" from the browser Bluetooth picker
 *  9. Dashboard goes live within one notify interval (5 s)
 *
 *  PLACEMENT TIPS
 *  - HC-SR04 #1: mount above drain opening, face pointing straight down
 *  - HC-SR04 #2: mount on tank lid, face pointing at the water surface
 *  - TDS probe : keep electrodes fully submerged, no air bubbles
 *  - ESP32     : weatherproof enclosure; BLE antenna must have clear air
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ---- BLE IDENTITY -----------------------------------------------------------
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define DEVICE_NAME         "GEOSENSE-WATER"
#define NODE_TYPE           "water"

// ---- SENSOR PINS ------------------------------------------------------------
#define TDS_PIN      35   // ADC1_CH7
#define DRAIN_TRIG    5
#define DRAIN_ECHO   18
#define TANK_TRIG    19
#define TANK_ECHO    23

// ---- CALIBRATION ------------------------------------------------------------
#define TDS_VREF      3.3f
#define TDS_ADC_MAX   4095.0f
#define TDS_SAMPLES   10
#define TDS_TEMP      25.0f     // assumed water temp (C) for compensation
#define SONAR_TIMEOUT 30000UL   // us: max echo wait (~5 m range)
#define SONAR_MIN_CM  1.0f      // reject echoes shorter than this (noise)
#define SONAR_MAX_CM  400.0f    // reject echoes longer than this (out of range)

// ---- NOTIFY INTERVAL --------------------------------------------------------
const unsigned long NOTIFY_INTERVAL = 5000;  // ms

// ---- GLOBALS ----------------------------------------------------------------
BLEServer         *pServer         = nullptr;
BLECharacteristic *pCharacteristic = nullptr;
bool               deviceConnected = false;
bool               wasConnected    = false;
unsigned long      lastNotify      = 0;
unsigned long      bootTime        = 0;

// ---- BLE SERVER CALLBACKS ---------------------------------------------------
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer * /*s*/) override {
    deviceConnected = true;
    Serial.println("[BLE]   Client connected");
  }
  void onDisconnect(BLEServer * /*s*/) override {
    deviceConnected = false;
    Serial.println("[BLE]   Client disconnected -- restarting advertising");
  }
};

// ---- TDS READING ------------------------------------------------------------
float readTDS() {
  long sum = 0;
  for (int i = 0; i < TDS_SAMPLES; i++) {
    sum += analogRead(TDS_PIN);
    delay(8);
  }
  float voltage = ((float)sum / TDS_SAMPLES) * TDS_VREF / TDS_ADC_MAX;
  float compV   = voltage / (1.0f + 0.02f * (TDS_TEMP - 25.0f));
  float tds     = (133.42f * compV * compV * compV
                 - 255.86f * compV * compV
                 +  857.39f * compV) * 0.5f;
  return max(0.0f, tds);
}

// ---- HC-SR04 READING --------------------------------------------------------
// Returns distance in cm.  -1.0 means no echo or out of range.
float readDistance(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long dur = pulseIn(echoPin, HIGH, SONAR_TIMEOUT);
  if (dur == 0) return -1.0f;
  float d = (float)dur * 0.0343f / 2.0f;
  return (d < SONAR_MIN_CM || d > SONAR_MAX_CM) ? -1.0f : d;
}

// ---- BUILD AND NOTIFY -------------------------------------------------------
void notifyData() {
  float tds    = readTDS();
  float w1     = readDistance(DRAIN_TRIG, DRAIN_ECHO);
  float w2     = readDistance(TANK_TRIG,  TANK_ECHO);
  unsigned long uptime = (millis() - bootTime) / 1000UL;

  char payload[200];
  snprintf(payload, sizeof(payload),
           "{\"type\":\"" NODE_TYPE "\","
           "\"tds\":%.1f,\"w1\":%.1f,\"w2\":%.1f,"
           "\"uptime\":%lu,\"rssi\":0}",
           tds, w1, w2, uptime);

  pCharacteristic->setValue((uint8_t *)payload, strlen(payload));
  pCharacteristic->notify();

  Serial.printf("[NOTIFY] TDS=%.1fppm  Drain=%.1fcm  Tank=%.1fcm  UP=%lus\n",
                tds, w1, w2, uptime);
}

// ---- SETUP ------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("\nGeoSense Pro -- Water Intelligence Node v3.0 (BLE)");

  pinMode(DRAIN_TRIG, OUTPUT); digitalWrite(DRAIN_TRIG, LOW);
  pinMode(DRAIN_ECHO, INPUT);
  pinMode(TANK_TRIG,  OUTPUT); digitalWrite(TANK_TRIG,  LOW);
  pinMode(TANK_ECHO,  INPUT);
  // GPIO 35 is ADC -- no pinMode needed

  BLEDevice::init(DEVICE_NAME);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdv = BLEDevice::getAdvertising();
  pAdv->addServiceUUID(SERVICE_UUID);
  pAdv->setScanResponse(true);
  pAdv->setMinPreferred(0x06);
  BLEDevice::startAdvertising();

  bootTime = millis();
  Serial.println("[READY] Advertising as \"" DEVICE_NAME "\"");
  Serial.println("[READY] Select \"Water Intelligence Node\" on the dashboard");
  Serial.println("[READY] then click Scan & Connect via BLE\n");
}

// ---- LOOP -------------------------------------------------------------------
void loop() {
  if (!deviceConnected && wasConnected) {
    delay(500);
    pServer->startAdvertising();
    wasConnected = false;
    Serial.println("[BLE]   Re-advertising...");
  }

  if (deviceConnected) {
    wasConnected = true;
    if (millis() - lastNotify >= NOTIFY_INTERVAL) {
      lastNotify = millis();
      notifyData();
    }
  }

  delay(20);
}
