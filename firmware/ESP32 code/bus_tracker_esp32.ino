#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// =============================================
//   CHANGE THESE TO YOUR WIFI CREDENTIALS
// =============================================
const char* ssid     = "Adeel";
const char* password = "adgjladgjl";

// =============================================
//   FIREBASE CONFIG (already filled in)
// =============================================
const char* FIREBASE_HOST = "college-bus-tracker-b6e39-default-rtdb.firebaseio.com";
const char* FIREBASE_AUTH = "AIzaSyCq-EcP5gLWQlTj4-YMBAGGouD9T0b2Qv0";

// =============================================
//   GPS SETUP
// =============================================
TinyGPSPlus gps;
HardwareSerial GPSSerial(2); // UART2 — GPIO16 (RX), GPIO17 (TX)

// How often to send GPS data (milliseconds)
const int SEND_INTERVAL = 5000; // 5 seconds
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  GPSSerial.begin(9600, SERIAL_8N1, 16, 17); // RX=GPIO16, TX=GPIO17

  Serial.println("=== College Bus Tracker ===");
  Serial.println("Connecting to WiFi...");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("Waiting for GPS fix... (point module to open sky)");
}

void loop() {
  // Read GPS data continuously
while (GPSSerial.available() > 0) {
    gps.encode(GPSSerial.read());
}
  // Send to Firebase every SEND_INTERVAL ms
  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    if (gps.location.isValid()) {
      double lat = gps.location.lat();
      double lng = gps.location.lng();
      int satellites = gps.satellites.value();

      Serial.print("GPS Fix! Lat: ");
      Serial.print(lat, 6);
      Serial.print(" Lng: ");
      Serial.print(lng, 6);
      Serial.print(" Satellites: ");
      Serial.println(satellites);

      sendToFirebase(lat, lng, satellites);

    } else {
      Serial.println("No GPS fix yet... make sure module has clear sky view");
      Serial.print("Characters received from GPS: ");
      Serial.println(gps.charsProcessed());
    }
  }
}

void sendToFirebase(double lat, double lng, int satellites) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected! Reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;

  // Firebase Realtime Database REST API URL
  String url = "https://";
  url += FIREBASE_HOST;
  url += "/bus/location.json?auth=";
  url += FIREBASE_AUTH;

  // Build JSON payload
  String payload = "{";
  payload += "\"lat\":" + String(lat, 6) + ",";
  payload += "\"lng\":" + String(lng, 6) + ",";
  payload += "\"satellites\":" + String(satellites) + ",";
  payload += "\"timestamp\":" + String(millis());
  payload += "}";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.PUT(payload); // PUT updates the same node every time

  if (httpCode == 200) {
    Serial.println("Firebase updated successfully!");
  } else {
    Serial.print("Firebase error, HTTP code: ");
    Serial.println(httpCode);
  }

  http.end();
}
