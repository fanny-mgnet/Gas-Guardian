#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebServer.h>

WebServer server(80);
Preferences preferences;

// ==================== CONFIGURATION ====================
const char* backendURL = "https://ozuwljacxkckqlpngvye.supabase.co/functions/v1/alert"; // Updated with the user's Supabase project reference.

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

// ==================== FUNCTION DECLARATIONS ====================
String getMacAddress();
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
void readGasSensor();
void checkGasLevels();
void activateAlarm();
void activateWarning();
void deactivateAlarm();
void updateStatusLED();
String getStatusString();

// ==================== SETUP ====================

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
  
  // Get device ID
  deviceId = getMacAddress();
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
    
    // Send startup alert
    String sensorDataStr = "{\"status\":\"online\", \"threshold\":" + String(gasThreshold) + ", \"device_id\":\"" + deviceId + "\"}";
    sendAlert("system", "Gas detector started and calibrated", sensorDataStr.c_str());
    
    Serial.println("✅ Gas Detector Ready!");
    Serial.println("📧 Email alerts enabled via Lovable + Resend");
  }
}

void loop() {
  if (setupMode) {
    server.handleClient();
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    delay(500);
  } else {
    // Normal operation
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

// ==================== WEB SERVER FOR SETUP ====================

void setupWebServer() {
  server.on("/api/configure", HTTP_POST, handleConfigure);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.onNotFound([]() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "text/html",
      "<html><body><h1>SmartGas Detector</h1><p>Use the mobile app to configure this device</p></body></html>");
  });
  // Handle CORS preflight requests
  server.on("/api/configure", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204); // No Content
  });
  Serial.println("🌐 Configuration server starting...");
  server.begin();
  Serial.println("🌐 Configuration server started on IP: " + WiFi.softAPIP().toString());
}

void handleConfigure() {
  Serial.println("⚙️ handleConfigure called.");
  server.sendHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
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
    
    delay(1000); // Add a small delay to ensure the response is sent before restarting
    ESP.restart();
  } else {
    server.send(400, "application/json", "{\"status\":\"error\", \"message\":\"Missing WiFi credentials\"}");
  }
}

String getJsonValue(String json, String key) {
  int keyStart = json.indexOf("\"" + key + "\":");
  if (keyStart == -1) return "";
  int valueStart = json.indexOf("\"", keyStart + key.length() + 3) + 1;
  int valueEnd = json.indexOf("\"", valueStart);
  return json.substring(valueStart, valueEnd);
}

void handleStatus() {
  server.sendHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  String status = "{";
  status += "\"device_id\":\"" + deviceId + "\",";
  status += "\"mode\":\"" + String(setupMode ? "setup" : "normal") + "\",";
  status += "\"wifi_connected\":" + String(wifiConnected ? "true" : "false") + ",";
  status += "\"gas_value\":" + String(gasValue);
  status += "}";
  server.send(200, "application/json", status);
}

// ==================== HOTSPOT MODE ====================

void startHotspotMode() {
  Serial.println("🔧 SETUP MODE ACTIVATED");
  
  WiFi.disconnect(true);
  delay(1000);
  
  bool apStarted = WiFi.softAP("SmartGas-Detector", "12345678");
  
  if (apStarted) {
    Serial.println("✅ HOTSPOT: SmartGas-Detector");
    Serial.println("🔑 PASSWORD: 12345678");
    Serial.println("🌐 IP: " + WiFi.softAPIP().toString());
    Serial.println("📱 Connect and use app to configure");
    
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

// ==================== WIFI FUNCTIONS ====================

String getMacAddress() {
  return WiFi.macAddress();
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
  } else {
    Serial.println("\n❌ WiFi Failed!");
    wifiConnected = false;
  }
}

// ==================== ALERT SYSTEM ====================

bool sendAlert(const char* alertType, const char* message, const char* sensorData) {
  if (!wifiConnected) {
    Serial.println("❌ No WiFi for alert");
    return false;
  }
  
  HTTPClient http;
  http.begin(backendURL);
  http.addHeader("Content-Type", "application/json");
  
  String jsonString = "{";
  jsonString += "\"device_id\":\"" + deviceId + "\",";
  jsonString += "\"alert_type\":\"" + String(alertType) + "\",";
  jsonString += "\"message\":\"" + String(message) + "\",";
  jsonString += "\"sensor_data\":" + String(sensorData);
  jsonString += "}";
  
  Serial.println("📤 Alert: " + String(alertType));
  
  int httpCode = http.POST(jsonString);
  bool success = (httpCode == 200);
  
  if (success) {
    Serial.println("✅ Alert sent to backend");
  } else {
    Serial.println("❌ Alert failed: " + String(httpCode));
  }
  
  http.end();
  return success;
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
  
  if (gasValue > gasThreshold && !gasAlertActive) {
    gasAlertActive = true;
    gasWarningActive = false;
    Serial.println("🚨 DANGEROUS GAS LEVEL!");
    activateAlarm();
    
    if (currentTime - lastAlertTime > ALERT_COOLDOWN) {
      String message = "🚨 EMERGENCY: Gas leak detected! Value: " + String(gasValue);
      String sensorData = "{\"gas_value\":" + String(gasValue) + ",\"threshold\":" + String(gasThreshold) + "}";
      sendAlert("gas_emergency", message.c_str(), sensorData.c_str());
      lastAlertTime = currentTime;
    }
  }
  else if (gasValue > gasWarningLevel && gasValue <= gasThreshold && !gasWarningActive && !gasAlertActive) {
    gasWarningActive = true;
    Serial.println("⚠️ Elevated gas levels");
    activateWarning();
    
    if (currentTime - lastAlertTime > ALERT_COOLDOWN) {
      String message = "⚠️ WARNING: Elevated gas levels. Value: " + String(gasValue);
      String sensorData = "{\"gas_value\":" + String(gasValue) + ",\"warning_level\":" + String(gasWarningLevel) + "}";
      sendAlert("gas_warning", message.c_str(), sensorData.c_str());
      lastAlertTime = currentTime;
    }
  }
  else if (gasValue <= gasWarningLevel && (gasAlertActive || gasWarningActive)) {
    Serial.println("✅ Gas levels normal");
    deactivateAlarm();
    
    if (currentTime - lastAlertTime > ALERT_COOLDOWN) {
      String message = "✅ ALL CLEAR: Gas levels normal";
      String sensorData = "{\"gas_value\":" + String(gasValue) + "}";
      sendAlert("gas_normal", message.c_str(), sensorData.c_str());
      lastAlertTime = currentTime;
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
    else if (command == "status") {
      Serial.println("=== STATUS ===");
      Serial.println("Mode: " + String(setupMode ? "SETUP" : "NORMAL"));
      Serial.println("WiFi: " + String(wifiConnected ? "Connected" : "Disconnected"));
      Serial.println("Gas: " + String(gasValue));
      Serial.println("Device: " + deviceId);
    }
    else if (command == "help") {
      Serial.println("=== COMMANDS ===");
      Serial.println("set_wifi SSID PASSWORD");
      Serial.println("test_alert, test_warning, status, help");
    }
  }
}