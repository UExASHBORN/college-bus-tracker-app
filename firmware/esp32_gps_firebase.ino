#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// ── WiFi Credentials ──
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ── Firebase Credentials ──
#define API_KEY "AIzaSyCAmA0QspxySSr4ybIdc14qt9uLUqo67n0"
#define DATABASE_URL "https://college-bus-tracker-app-d318a-default-rtdb.firebaseio.com"
#define USER_EMAIL "driver@iul.ac.in"
#define USER_PASSWORD "driver_secure_password"

// ── GPS Configuration ──
#define RXPin 16
#define TXPin 17
#define GPSBaud 9600

TinyGPSPlus gps;
HardwareSerial gpsSerial(1);

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected to Wi-Fi");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  config.token_status_callback = tokenStatusCallback; 
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (Firebase.ready() && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    if (gps.location.isValid()) {
      double lat = gps.location.lat();
      double lng = gps.location.lng();
      int satellites = gps.satellites.value();

      FirebaseJson json;
      json.set("lat", lat);
      json.set("lng", lng);
      json.set("satellites", satellites);
      json.set("timestamp", String(millis()));
      json.set("source", "esp32");

      Serial.printf("Pushing GPS: Lat: %f, Lng: %f\n", lat, lng);
      
      if (Firebase.RTDB.setJSON(&fbdo, "bus/location", &json)) {
        Serial.println("Data pushed successfully");
      } else {
        Serial.println("Failed to push data: " + fbdo.errorReason());
      }
    } else {
      Serial.println("Waiting for valid GPS signal...");
    }
  }
}
