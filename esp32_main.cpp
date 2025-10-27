#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <esp_system.h> // Required for esp_fill_random

WebServer server(80);
DNSServer dnsServer;
Preferences preferences;

const byte DNS_PORT = 53;

// ==================== CONFIGURATION ====================
const char* SUPABASE_URL = "https://your-project-ref.supabase.co";
const char* SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";
const char* ALERTS_TABLE_ENDPOINT = "/rest/v1/alerts";
const char* DEVICE_READINGS_TABLE_ENDPOINT = "/rest/v1/device_readings";
const char* DEVICES_TABLE_ENDPOINT = "/rest/v1/devices";

// Device info
String deviceId;
bool setupMode = true;
bool wifiConnected = false;

// ==================== HARDWARE PINS ====================
#define MQ5_SENSOR_PIN 34
#define BUZZER_PIN 25
#define STATUS_LED 2
#define ALERT_LED 4

// ==================== GAS DETECTION SETTINGS ====================
float gasThreshold = 150;
float gasWarningLevel = 100;
float gasValue = 0;
float gasPercentage = 0;
bool gasAlertActive = false;
bool gasWarningActive = false;

unsigned long lastAlertTime = 0;
const unsigned long ALERT_COOLDOWN = 60000;

// ==================== CAPTIVE PORTAL DETECTION URLs ====================
const char* captivePortalURLs[] = {
  "/generate_204",
  "/connecttest.txt",
  "/hotspot-detect.html",
  "/library/test/success.html",
  "/kindle-wifi/wifistub.html",
  "/ncsi.txt",
  "/fwlink",
  "/redirect",
  "/captiveportal",
  "/success.txt",
  ""
};

// ==================== FUNCTION DECLARATIONS ====================
String generateUUID();
String getDeviceId();
void connectToWiFi();
void startHotspotMode();
void setupWebServer();
void handleConfigure();
void handleStatus();
String getJsonValue(String json, String key);
void calibrateSensor();
void blinkStartupSequence();
void blinkError(int times);
bool sendAlert(const char* alertType, const char* message, const char* sensorData = "{}");
bool sendDeviceReading(float temperature, float humidity, float pressure, float gas_level);
bool registerDevice();
void readGasSensor();
void checkGasLevels();
void activateAlarm();
void activateWarning();
void deactivateAlarm();
void updateStatusLED();
String getStatusString();
String captivePortalPage();
void handleConnectForm();
void handleCaptivePortal();
void handleChromeIntent();
void handleRoot(); // Added missing declaration

// ==================== SETUP FUNCTION ====================
void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(MQ5_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(ALERT_LED, OUTPUT);
  
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(STATUS_LED, LOW);
  digitalWrite(ALERT_LED, LOW);
  
  // Get or generate device ID
  deviceId = getDeviceId();
  Serial.println("🚀 SmartGas Detector Starting...");
  Serial.println("Device ID: " + deviceId);
  
  blinkStartupSequence();
  
  // Try connecting to stored WiFi first
  connectToWiFi();
  
  if (!wifiConnected) {
    startHotspotMode();
    setupWebServer();
  } else {
    setupMode = false;
    calibrateSensor();
    
    // Register device and send initial alert
    if (registerDevice()) {
      String sensorDataStr = "{\"status\":\"online\", \"threshold\":" + String(gasThreshold) + ", \"device_id\":\"" + deviceId + "\"}";
      sendAlert("system", "Gas detector started and calibrated", sensorDataStr.c_str());
    }
    
    Serial.println("✅ Gas Detector Ready!");
  }
}

// ==================== LOOP FUNCTION ====================
void loop() {
  if (setupMode) {
    dnsServer.processNextRequest();
    server.handleClient();
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    delay(500);
  } else {
    static unsigned long lastWifiCheck = 0;
    if (millis() - lastWifiCheck > 30000) {
      if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected! Reconnecting...");
        wifiConnected = false;
        connectToWiFi();
      }
      lastWifiCheck = millis();
    }
    
    readGasSensor();
    checkGasLevels();
    updateStatusLED();
    
    static unsigned long lastSerialPrint = 0;
    if (millis() - lastSerialPrint > 5000) {
      Serial.println("📊 Gas - Raw: " + String(gasValue) + " | %: " + String(gasPercentage, 1) + "% | Status: " + getStatusString());
      lastSerialPrint = millis();
    }
  }
  
  delay(1000);
}

// ==================== SUPABASE API FUNCTIONS ====================
bool sendSupabaseRequest(const char* endpoint, const String& payload, String& response, int& httpCode) {
  if (!wifiConnected) {
    Serial.println("❌ No WiFi for Supabase request");
    return false;
  }

  HTTPClient http;
  String url = String(SUPABASE_URL) + endpoint;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  http.setTimeout(10000); // 10 second timeout
  http.setReuse(true);

  Serial.println("📤 Sending to Supabase: " + url);
  Serial.println("📦 Payload: " + payload);

  httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.println("✅ HTTP Response code: " + String(httpCode));
    response = http.getString();
    Serial.println("Response: " + response);
    http.end();
    return true;
  } else {
    Serial.println("❌ HTTP Request failed: " + String(httpCode));
    Serial.println("Error: " + http.errorToString(httpCode));
    http.end();
    return false;
  }
}

bool registerDevice() {
  preferences.begin("device-config", false);
  String storedDeviceId = preferences.getString("device_id", "");
  preferences.end();

  if (storedDeviceId == deviceId) {
    Serial.println("Device already registered.");
    return true;
  }

  String payload = "{";
  payload += "\"id\":\"" + deviceId + "\",";
  payload += "\"name\":\"SmartGas Detector " + deviceId.substring(12) + "\",";
  payload += "\"description\":\"ESP32 based gas leak detector\",";
  payload += "\"location\":\"Unknown\""; // Can be updated later via web interface
  payload += "}";

  String response;
  int httpCode;
  if (sendSupabaseRequest(DEVICES_TABLE_ENDPOINT, payload, response, httpCode)) {
    if (httpCode == 201) { // 201 Created
      Serial.println("✅ Device registered successfully in Supabase.");
      preferences.begin("device-config", false);
      preferences.putString("device_id", deviceId);
      preferences.end();
      return true;
    } else if (httpCode == 409) { // Conflict, device already exists
      Serial.println("Device already exists in Supabase (likely re-registered).");
      preferences.begin("device-config", false);
      preferences.putString("device_id", deviceId);
      preferences.end();
      return true;
    } else {
      Serial.println("❌ Failed to register device in Supabase. HTTP Code: " + String(httpCode));
      return false;
    }
  }
  return false;
}

bool sendDeviceReading(float temperature, float humidity, float pressure, float gas_level) {
  String payload = "{";
  payload += "\"device_id\":\"" + deviceId + "\",";
  payload += "\"temperature\":" + String(temperature) + ",";
  payload += "\"humidity\":" + String(humidity) + ",";
  payload += "\"pressure\":" + String(pressure) + ",";
  payload += "\"gas_level\":" + String(gas_level);
  payload += "}";

  String response;
  int httpCode;
  if (sendSupabaseRequest(DEVICE_READINGS_TABLE_ENDPOINT, payload, response, httpCode)) {
    if (httpCode == 201) {
      Serial.println("✅ Device reading sent successfully.");
      return true;
    } else {
      Serial.println("❌ Failed to send device reading. HTTP Code: " + String(httpCode));
      return false;
    }
  }
  return false;
}

// ==================== WEB SERVER FUNCTIONS ====================
void setupWebServer() {
  server.on("/", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/html", captivePortalPage());
  });

  for (int i = 0; strlen(captivePortalURLs[i]) > 0; i++) {
    server.on(captivePortalURLs[i], HTTP_GET, handleCaptivePortal);
  }

  server.on("/chrome-intent", HTTP_GET, handleChromeIntent);
  server.on("/connect", HTTP_POST, handleConnectForm);
  server.on("/api/configure", HTTP_POST, handleConfigure);
  server.on("/api/status", HTTP_GET, handleStatus);

  server.on("/api/configure", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });

  server.onNotFound([]() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    if (setupMode) {
      String host = server.hostHeader();
      String url = server.uri();
      
      if (url.indexOf("google") != -1 || url.indexOf("gstatic") != -1 || url.indexOf("chrome") != -1) {
        server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/chrome-intent");
        server.send(302, "text/plain", "");
        return;
      }
      
      server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/");
      server.send(302, "text/plain", "");
    } else {
      server.send(404, "text/plain", "Not found");
    }
  });

  server.begin();
  Serial.println("🌐 Configuration server started on IP: " + WiFi.softAPIP().toString());
}

void handleCaptivePortal() {
  Serial.println("📱 Captive portal detection: " + server.uri());
  
  if (server.uri() == "/generate_204") {
    server.send(200, "text/html", captivePortalPage());
    return;
  }
  
  server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/");
  server.send(302, "text/plain", "");
}

void handleChromeIntent() {
  String html = R"rawliteral(
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>SmartGas Setup - Open in Chrome</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0; 
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        color: #333;
      }
      .card { 
        background: white; 
        padding: 30px; 
        border-radius: 20px; 
        box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
        width: 100%; 
        max-width: 450px;
        text-align: center;
      }
      .chrome-icon {
        font-size: 64px;
        margin-bottom: 20px;
      }
      h1 { 
        color: #2d3748; 
        margin: 0 0 15px 0;
        font-weight: 700;
      }
      .steps {
        text-align: left;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
      }
      .btn {
        display: inline-block;
        background: #4285f4;
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        margin: 10px 5px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="chrome-icon">🌐</div>
      <h1>Open in Chrome Browser</h1>
      <p>For the best setup experience, please use Chrome browser.</p>
      
      <div class="steps">
        <h3>📱 How to open in Chrome:</h3>
        <ol>
          <li><strong>Open Chrome</strong> app on your phone</li>
          <li>Type this address in the address bar:</li>
          <li style="text-align: center; margin: 15px 0;">
            <code style="background: #e9ecef; padding: 8px 15px; border-radius: 5px; font-size: 14px;">)rawliteral" + WiFi.softAPIP().toString() + R"rawliteral(</code>
          </li>
          <li>Press <strong>Go</strong> or <strong>Enter</strong></li>
          <li>Complete the setup form</li>
        </ol>
      </div>
      
      <a href="http://)rawliteral" + WiFi.softAPIP().toString() + R"rawliteral(" class="btn">🚀 Open Setup Page</a>
    </div>
  </body>
  </html>
  )rawliteral";
  
  server.send(200, "text/html", html);
}

void handleConfigure() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  String body = server.arg("plain");
  Serial.println("📥 Received config body: " + body);
  
  String ssid = getJsonValue(body, "wifi_ssid");
  String password = getJsonValue(body, "wifi_password");
  String email = getJsonValue(body, "email");
  String mobile = getJsonValue(body, "mobile_number");
  
  if (ssid.length() > 0 && password.length() > 0) {
    preferences.begin("wifi-config", false);
    preferences.putString("ssid", ssid);
    preferences.putString("password", password);
    preferences.putString("email", email);
    preferences.putString("mobile", mobile);
    preferences.end();
    
    Serial.println("✅ WiFi configured: " + ssid);
    server.send(200, "application/json", "{\"status\":\"success\", \"message\":\"Device configured! Restarting...\"}");
    
    delay(1000);
    ESP.restart();
  } else {
    server.send(400, "application/json", "{\"status\":\"error\", \"message\":\"Missing WiFi credentials\"}");
  }
}

void handleConnectForm() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  String ssid = server.arg("ssid");
  String password = server.arg("password");
  String email = server.arg("email");
  String mobile = server.arg("mobile");

  if (ssid.length() > 0 && password.length() > 0) {
    preferences.begin("wifi-config", false);
    preferences.putString("ssid", ssid);
    preferences.putString("password", password);
    preferences.putString("email", email);
    preferences.putString("mobile", mobile);
    preferences.end();

    String html = R"rawliteral(
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>SmartGas - Success</title>
      <style>
        body { font-family: Arial; background: #f0f9ff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
        .success { color: #10b981; font-size: 48px; margin-bottom: 20px; }
        h2 { color: #059669; margin: 0 0 15px 0; }
      </style>
      <script>
        setTimeout(function() {
          window.close();
        }, 3000);
      </script>
    </head>
    <body>
      <div class="card">
        <div class="success">✅</div>
        <h2>Wi-Fi Saved Successfully!</h2>
        <p>Device is connecting to your network...</p>
        <p><strong>SSID:</strong> )rawliteral" + ssid + R"rawliteral(</p>
        <p>This window will close automatically.</p>
      </div>
    </body>
    </html>
    )rawliteral";
    
    server.send(200, "text/html", html);
    Serial.println("✅ WiFi configured via captive portal: " + ssid);
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/html", "<h3 style='color: red;'>❌ Missing SSID or password</h3>");
  }
}

String getJsonValue(String json, String key) {
  int keyStart = json.indexOf("\"" + key + "\":");
  if (keyStart == -1) return "";
  int valueStart = json.indexOf("\"", keyStart + key.length() + 3) + 1;
  int valueEnd = json.indexOf("\"", valueStart);
  if (valueStart == 0 || valueEnd == -1) return "";
  return json.substring(valueStart, valueEnd);
}

void handleStatus() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  String status = "{";
  status += "\"device_id\":\"" + deviceId + "\",";
  status += "\"mode\":\"" + String(setupMode ? "setup" : "normal") + "\",";
  status += "\"wifi_connected\":" + String(wifiConnected ? "true" : "false") + ",";
  status += "\"gas_value\":" + String(gasValue) + ",";
  status += "\"gas_percentage\":" + String(gasPercentage) + ",";
  status += "\"threshold\":" + String(gasThreshold) + ",";
  status += "\"warning_level\":" + String(gasWarningLevel) + ",";
  status += "\"alert_active\":" + String(gasAlertActive ? "true" : "false") + ",";
  status += "\"warning_active\":" + String(gasWarningActive ? "true" : "false");
  status += "}";
  server.send(200, "application/json", status);
}

// ==================== WIFI & HOTSPOT FUNCTIONS ====================
void startHotspotMode() {
  Serial.println("🔧 SETUP MODE ACTIVATED");
  
  WiFi.mode(WIFI_AP_STA);
  WiFi.disconnect(true);
  delay(1000);
  
  String apSSID = "SmartGas-" + deviceId.substring(12);
  bool apStarted = WiFi.softAP(apSSID.c_str(), "12345678");
  
  if (apStarted) {
    IPAddress apIP = WiFi.softAPIP();
    Serial.println("✅ HOTSPOT: " + apSSID);
    Serial.println("🔑 PASSWORD: 12345678");
    Serial.println("🌐 IP: " + apIP.toString());
    
    dnsServer.start(DNS_PORT, "*", apIP);
    setupMode = true;
    
    for(int i = 0; i < 5; i++) {
      digitalWrite(STATUS_LED, HIGH);
      digitalWrite(ALERT_LED, HIGH);
      delay(200);
      digitalWrite(STATUS_LED, LOW);
      digitalWrite(ALERT_LED, LOW);
      delay(200);
    }
  } else {
    Serial.println("❌ Hotspot failed!");
    blinkError(10);
  }
}

String generateUUID() {
  uint8_t uuidBytes[16];
  esp_fill_random(uuidBytes, sizeof(uuidBytes));

  // Set UUID version (4) and variant (RFC 4122)
  uuidBytes[6] = (uuidBytes[6] & 0x0F) | 0x40; // Version 4
  uuidBytes[8] = (uuidBytes[8] & 0x3F) | 0x80; // RFC 4122 variant

  char uuidStr[37];
  sprintf(uuidStr, "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
          uuidBytes[0], uuidBytes[1], uuidBytes[2], uuidBytes[3],
          uuidBytes[4], uuidBytes[5], uuidBytes[6], uuidBytes[7],
          uuidBytes[8], uuidBytes[9], uuidBytes[10], uuidBytes[11],
          uuidBytes[12], uuidBytes[13], uuidBytes[14], uuidBytes[15]);
  return String(uuidStr);
}

String getDeviceId() {
  preferences.begin("device-config", false);
  String storedDeviceId = preferences.getString("uuid", "");
  preferences.end();

  if (storedDeviceId == "") {
    String newUuid = generateUUID();
    preferences.begin("device-config", false);
    preferences.putString("uuid", newUuid);
    preferences.end();
    Serial.println("Generated new Device ID: " + newUuid);
    return newUuid;
  } else {
    Serial.println("Using stored Device ID: " + storedDeviceId);
    return storedDeviceId;
  }
}

void connectToWiFi() {
  preferences.begin("wifi-config", true);
  String ssid = preferences.getString("ssid", "");
  String password = preferences.getString("password", "");
  preferences.end();
  
  if (ssid == "" || password == "") {
    Serial.println("❌ No WiFi credentials");
    wifiConnected = false;
    return;
  }
  
  Serial.println("📶 Connecting to: " + ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.println("IP: " + WiFi.localIP().toString());
    wifiConnected = true;
    setupMode = false;
  } else {
    Serial.println("\n❌ WiFi Failed!");
    wifiConnected = false;
    setupMode = true;
  }
}

// ==================== ALERT SYSTEM ====================
bool sendAlert(const char* alertType, const char* message, const char* sensorData) {
  String payload = "{";
  payload += "\"device_id\":\"" + deviceId + "\",";
  payload += "\"alert_type\":\"" + String(alertType) + "\",";
  payload += "\"message\":\"" + String(message) + "\",";
  payload += "\"sensor_data\":" + String(sensorData); // sensor_data is a JSON string
  payload += "}";

  String response;
  int httpCode;
  if (sendSupabaseRequest(ALERTS_TABLE_ENDPOINT, payload, response, httpCode)) {
    if (httpCode == 201) {
      Serial.println("✅ Alert sent successfully.");
      return true;
    } else {
      Serial.println("❌ Failed to send alert. HTTP Code: " + String(httpCode));
      return false;
    }
  }
  return false;
}

// ==================== GAS SENSOR FUNCTIONS ====================
void readGasSensor() {
  int sensorValue = analogRead(MQ5_SENSOR_PIN);
  gasValue = sensorValue;
  gasPercentage = (gasValue / 2500.0) * 100.0;
  if (gasPercentage > 100) gasPercentage = 100;
  if (gasPercentage < 0) gasPercentage = 0;
}

void checkGasLevels() {
  unsigned long currentTime = millis();
  
  // Send device readings periodically
  static unsigned long lastReadingTime = 0;
  const unsigned long READING_INTERVAL = 5000; // Send reading every 5 seconds
  if (currentTime - lastReadingTime > READING_INTERVAL) {
    sendDeviceReading(0, 0, 0, gasValue); // Assuming temperature, humidity, pressure are 0 for now
    lastReadingTime = currentTime;
  }

  if (gasValue > gasThreshold && !gasAlertActive) {
    gasAlertActive = true;
    gasWarningActive = false;
    Serial.println("🚨 DANGEROUS GAS LEVEL!");
    activateAlarm();
    
    if (currentTime - lastAlertTime > ALERT_COOLDOWN) {
      String message = "🚨 EMERGENCY: Gas leak detected! Value: " + String(gasValue);
      String sensorData = "{\"gas_value\":" + String(gasValue) + ",\"gas_percentage\":" + String(gasPercentage) + ",\"threshold\":" + String(gasThreshold) + "}";
      if (sendAlert("gas_emergency", message.c_str(), sensorData.c_str())) {
        lastAlertTime = currentTime;
      }
    }
  }
  else if (gasValue > gasWarningLevel && gasValue <= gasThreshold && !gasWarningActive && !gasAlertActive) {
    gasWarningActive = true;
    Serial.println("⚠️ Elevated gas levels");
    activateWarning();
    
    if (currentTime - lastAlertTime > ALERT_COOLDOWN) {
      String message = "⚠️ WARNING: Elevated gas levels. Value: " + String(gasValue);
      String sensorData = "{\"gas_value\":" + String(gasValue) + ",\"gas_percentage\":" + String(gasPercentage) + ",\"warning_level\":" + String(gasWarningLevel) + "}";
      if (sendAlert("gas_warning", message.c_str(), sensorData.c_str())) {
        lastAlertTime = currentTime;
      }
    }
  }
  else if (gasValue <= gasWarningLevel && (gasAlertActive || gasWarningActive)) {
    Serial.println("✅ Gas levels normal");
    deactivateAlarm();
    
    if (currentTime - lastAlertTime > ALERT_COOLDOWN) {
      String message = "✅ ALL CLEAR: Gas levels normal";
      String sensorData = "{\"gas_value\":" + String(gasValue) + ",\"gas_percentage\":" + String(gasPercentage) + "}";
      if (sendAlert("gas_normal", message.c_str(), sensorData.c_str())) {
        lastAlertTime = currentTime;
      }
    }
    gasAlertActive = false;
    gasWarningActive = false;
  }
}

void calibrateSensor() {
  Serial.println("🔧 Calibrating sensor...");
  float sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(MQ5_SENSOR_PIN);
    delay(50);
  }
  float avgValue = sum / 100;
  gasThreshold = avgValue * 1.5;
  gasWarningLevel = avgValue * 1.2;
  Serial.println("📏 Calibration Complete - Clean Air: " + String(avgValue));
  Serial.println("📊 Threshold: " + String(gasThreshold) + " | Warning Level: " + String(gasWarningLevel));
}

// ==================== ALARM FUNCTIONS ====================
void activateAlarm() {
  Serial.println("🔊 EMERGENCY ALARM");
  for (int i = 0; i < 10; i++) {
    digitalWrite(ALERT_LED, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(ALERT_LED, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
  digitalWrite(ALERT_LED, HIGH);
  tone(BUZZER_PIN, 1000);
}

void activateWarning() {
  Serial.println("🔔 WARNING ALERT");
  for (int i = 0; i < 5; i++) {
    digitalWrite(ALERT_LED, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(500);
    digitalWrite(ALERT_LED, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);
  }
}

void deactivateAlarm() {
  Serial.println("🔇 Alarm off");
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(ALERT_LED, LOW);
  noTone(BUZZER_PIN);
}

// ==================== STATUS INDICATORS ====================
void updateStatusLED() {
  static unsigned long lastBlink = 0;
  
  if (gasAlertActive) {
    if (millis() - lastBlink > 200) {
      digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
      lastBlink = millis();
    }
  } else if (gasWarningActive) {
    if (millis() - lastBlink > 500) {
      digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
      lastBlink = millis();
    }
  } else {
    if (millis() - lastBlink > 2000) {
      digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
      lastBlink = millis();
    }
  }
}

void blinkStartupSequence() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(STATUS_LED, HIGH);
    digitalWrite(ALERT_LED, HIGH);
    tone(BUZZER_PIN, 600);
    delay(200);
    digitalWrite(STATUS_LED, LOW);
    digitalWrite(ALERT_LED, LOW);
    noTone(BUZZER_PIN);
    delay(200);
  }
}

void blinkError(int times) {
  for(int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    digitalWrite(ALERT_LED, HIGH);
    delay(200);
    digitalWrite(STATUS_LED, LOW);
    digitalWrite(ALERT_LED, LOW);
    delay(200);
  }
}

String getStatusString() {
  if (gasAlertActive) return "EMERGENCY";
  if (gasWarningActive) return "WARNING";
  return "NORMAL";
}

// ==================== SERIAL COMMANDS ====================
void serialEvent() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command.startsWith("set_wifi")) {
      int firstSpace = command.indexOf(' ');
      int secondSpace = command.indexOf(' ', firstSpace + 1);
      if (firstSpace != -1 && secondSpace != -1) {
        String ssid = command.substring(firstSpace + 1, secondSpace);
        String password = command.substring(secondSpace + 1);
        preferences.begin("wifi-config", false);
        preferences.putString("ssid", ssid);
        preferences.putString("password", password);
        preferences.end();
        Serial.println("✅ WiFi saved: " + ssid);
        delay(2000);
        ESP.restart();
      }
    }
    else if (command == "test_alert") {
      gasValue = gasThreshold + 100;
      Serial.println("🔴 TEST: Emergency simulation");
    }
    else if (command == "test_warning") {
      gasValue = gasWarningLevel + 30;
      Serial.println("🟡 TEST: Warning simulation");
    }
    else if (command == "calibrate") {
      calibrateSensor();
    }
    else if (command == "status") {
      Serial.println("=== STATUS ===");
      Serial.println("Mode: " + String(setupMode ? "SETUP" : "NORMAL"));
      Serial.println("WiFi: " + String(wifiConnected ? "Connected" : "Disconnected"));
      Serial.println("Gas Value: " + String(gasValue));
      Serial.println("Gas %: " + String(gasPercentage));
      Serial.println("Threshold: " + String(gasThreshold));
      Serial.println("Warning Level: " + String(gasWarningLevel));
      Serial.println("Device: " + deviceId);
    }
    else if (command == "test_alert_backend") {
      String testData = "{\"test\":\"value\", \"gas\":123}";
      if (sendAlert("test", "Alert backend connection test", testData.c_str())) {
        Serial.println("✅ Alert backend test successful");
      } else {
        Serial.println("❌ Alert backend test failed");
      }
    }
    else if (command == "test_reading_backend") {
      if (sendDeviceReading(25.0, 60.0, 1012.0, 50.0)) {
        Serial.println("✅ Reading backend test successful");
      } else {
        Serial.println("❌ Reading backend test failed");
      }
    }
    else if (command == "register_device") {
      if (registerDevice()) {
        Serial.println("✅ Device registration successful");
      } else {
        Serial.println("❌ Device registration failed");
      }
    }
    else if (command == "help") {
      Serial.println("=== COMMANDS ===");
      Serial.println("set_wifi SSID PASSWORD");
      Serial.println("test_alert, test_warning, calibrate, status, test_alert_backend, test_reading_backend, register_device, help");
    }
  }
}

// ==================== CAPTIVE PORTAL HTML ====================
String captivePortalPage() {
  return R"rawliteral(
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#007bff">
    <title>SmartGas Setup</title>
    <style>
      * { box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0; 
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        color: #333;
      }
      .card { 
        background: white; 
        padding: 30px; 
        border-radius: 20px; 
        box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
        width: 100%; 
        max-width: 450px;
        text-align: center;
      }
      .logo { 
        font-size: 48px; 
        margin-bottom: 10px; 
      }
      h1 { 
        color: #2d3748; 
        margin: 0 0 10px 0;
        font-weight: 700;
      }
      .device-id {
        background: #f7fafc;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 25px;
        font-family: monospace;
        font-size: 14px;
        color: #4a5568;
      }
      label { 
        display: block; 
        text-align: left;
        font-size: 14px; 
        font-weight: 600;
        margin-top: 15px; 
        margin-bottom: 5px;
        color: #4a5568;
      }
      input { 
        width: 100%; 
        padding: 12px 15px; 
        margin-top: 5px; 
        border-radius: 10px; 
        border: 2px solid #e2e8f0; 
        font-size: 16px;
      }
      input:focus {
        outline: none;
        border-color: #007bff;
      }
      button { 
        margin-top: 25px; 
        width: 100%; 
        padding: 15px; 
        border-radius: 10px; 
        border: 0; 
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white; 
        font-size: 16px; 
        font-weight: 600;
        cursor: pointer;
      }
      .instructions {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 20px;
        text-align: left;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="logo">🔧</div>
      <h1>SmartGas Setup</h1>
      <div class="device-id">
        Device ID: )rawliteral" + deviceId + R"rawliteral(
      </div>
      
      <div class="instructions">
        <h3>📱 Setup Instructions:</h3>
        <p>1. Select your Wi-Fi network below</p>
        <p>2. Enter your Wi-Fi password</p>
        <p>3. Add contact info for alerts (optional)</p>
        <p>4. Click <strong>Connect Device</strong></p>
      </div>
      
      <form action="/connect" method="post">
        <label for="ssid">Wi-Fi Network</label>
        <input id="ssid" name="ssid" placeholder="Your Wi-Fi network name" required autofocus>
        
        <label for="password">Wi-Fi Password</label>
        <input id="password" name="password" type="password" placeholder="Your Wi-Fi password" required>
        
        <label for="email">Email Address (optional)</label>
        <input id="email" name="email" type="email" placeholder="you@example.com">
        
        <label for="mobile">Mobile Number (optional)</label>
        <input id="mobile" name="mobile" placeholder="+1234567890">
        
        <button type="submit">🔗 Connect Device</button>
      </form>
    </div>
    
    <script>
      document.getElementById('ssid').focus();
      
      document.querySelector('form').addEventListener('submit', function() {
        const button = document.querySelector('button');
        button.innerHTML = '🔄 Connecting...';
        button.disabled = true;
      });
    </script>
  </body>
  </html>
  )rawliteral";
}